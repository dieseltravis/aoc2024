(function () {
  'use strict';

  // MIT astar: https://github.com/bgrins/javascript-astar/blob/master/astar.js
  // (modified to conform to semistandard)
  const astar = () => {
    // javascript-astar 0.4.1
    // http://github.com/bgrins/javascript-astar
    function pathTo (node) {
      let curr = node;
      const path = [];
      while (curr.parent) {
        path.unshift(curr);
        curr = curr.parent;
      }
      return path;
    }

    function getHeap () {
      return new BinaryHeap(function (node) {
        return node.f;
      });
    }

    const astar = {
      /**
      * Perform an A* Search on a graph given a start and end node.
      * @param {Graph} graph
      * @param {GridNode} start
      * @param {GridNode} end
      * @param {Object} [options]
      * @param {bool} [options.closest] Specifies whether to return the
                path to the closest node if the target is unreachable.
      * @param {Function} [options.heuristic] Heuristic function (see
      *          astar.heuristics).
      */
      search: function (graph, start, end, options) {
        graph.cleanDirty();
        options = options || {};
        const heuristic = options.heuristic || astar.heuristics.manhattan;
        const closest = options.closest || false;

        const openHeap = getHeap();
        let closestNode = start; // set the start node to be the closest if required

        start.h = heuristic(start, end);
        graph.markDirty(start);

        openHeap.push(start);

        while (openHeap.size() > 0) {
          // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
          const currentNode = openHeap.pop();

          // End case -- result has been found, return the traced path.
          if (currentNode === end) {
            return pathTo(currentNode);
          }

          // Normal case -- move currentNode from open to closed, process each of its neighbors.
          currentNode.closed = true;

          // Find all neighbors for the current node.
          const neighbors = graph.neighbors(currentNode);

          for (let i = 0, il = neighbors.length; i < il; ++i) {
            const neighbor = neighbors[i];

            if (neighbor.closed || neighbor.isWall()) {
              // Not a valid node to process, skip to next neighbor.
              continue;
            }

            // The g score is the shortest distance from start to current node.
            // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
            const gScore = currentNode.g + neighbor.getCost(currentNode);
            const beenVisited = neighbor.visited;

            if (!beenVisited || gScore < neighbor.g) {
              // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
              neighbor.visited = true;
              neighbor.parent = currentNode;
              neighbor.h = neighbor.h || heuristic(neighbor, end);
              neighbor.g = gScore;
              neighbor.f = neighbor.g + neighbor.h;
              graph.markDirty(neighbor);
              if (closest) {
                // If the neighbour is closer than the current closestNode or if it's equally close but has
                // a cheaper path than the current closest node then it becomes the closest node
                if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                  closestNode = neighbor;
                }
              }

              if (!beenVisited) {
                // Pushing to heap will put it in proper place based on the 'f' value.
                openHeap.push(neighbor);
              } else {
                // Already seen the node, but since it has been rescored we need to reorder it in the heap
                openHeap.rescoreElement(neighbor);
              }
            }
          }
        }

        if (closest) {
          return pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
      },
      // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
      heuristics: {
        manhattan: function (pos0, pos1) {
          const d1 = Math.abs(pos1.x - pos0.x);
          const d2 = Math.abs(pos1.y - pos0.y);
          return d1 + d2;
        },
        diagonal: function (pos0, pos1) {
          const D = 1;
          const D2 = Math.sqrt(2);
          const d1 = Math.abs(pos1.x - pos0.x);
          const d2 = Math.abs(pos1.y - pos0.y);
          return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        }
      },
      cleanNode: function (node) {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
      }
    };

    /**
     * A graph memory structure
     * @param {Array} gridIn 2D array of input weights
     * @param {Object} [options]
     * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
     */
    function Graph (gridIn, options) {
      options = options || {};
      this.nodes = [];
      this.diagonal = !!options.diagonal;
      this.grid = [];
      for (let x = 0; x < gridIn.length; x++) {
        this.grid[x] = [];

        for (let y = 0, row = gridIn[x]; y < row.length; y++) {
          const node = new GridNode(x, y, row[y]);
          this.grid[x][y] = node;
          this.nodes.push(node);
        }
      }
      this.init();
    }

    Graph.prototype.init = function () {
      this.dirtyNodes = [];
      for (let i = 0; i < this.nodes.length; i++) {
        astar.cleanNode(this.nodes[i]);
      }
    };

    Graph.prototype.cleanDirty = function () {
      for (let i = 0; i < this.dirtyNodes.length; i++) {
        astar.cleanNode(this.dirtyNodes[i]);
      }
      this.dirtyNodes = [];
    };

    Graph.prototype.markDirty = function (node) {
      this.dirtyNodes.push(node);
    };

    Graph.prototype.neighbors = function (node) {
      const ret = [];
      const x = node.x;
      const y = node.y;
      const grid = this.grid;

      // West
      if (grid[x - 1] && grid[x - 1][y]) {
        ret.push(grid[x - 1][y]);
      }

      // East
      if (grid[x + 1] && grid[x + 1][y]) {
        ret.push(grid[x + 1][y]);
      }

      // South
      if (grid[x] && grid[x][y - 1]) {
        ret.push(grid[x][y - 1]);
      }

      // North
      if (grid[x] && grid[x][y + 1]) {
        ret.push(grid[x][y + 1]);
      }

      if (this.diagonal) {
        // Southwest
        if (grid[x - 1] && grid[x - 1][y - 1]) {
          ret.push(grid[x - 1][y - 1]);
        }

        // Southeast
        if (grid[x + 1] && grid[x + 1][y - 1]) {
          ret.push(grid[x + 1][y - 1]);
        }

        // Northwest
        if (grid[x - 1] && grid[x - 1][y + 1]) {
          ret.push(grid[x - 1][y + 1]);
        }

        // Northeast
        if (grid[x + 1] && grid[x + 1][y + 1]) {
          ret.push(grid[x + 1][y + 1]);
        }
      }

      return ret;
    };

    Graph.prototype.toString = function () {
      const graphString = [];
      const nodes = this.grid;
      for (let x = 0; x < nodes.length; x++) {
        const rowDebug = [];
        const row = nodes[x];
        for (let y = 0; y < row.length; y++) {
          rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(' '));
      }
      return graphString.join('\n');
    };

    function GridNode (x, y, weight) {
      this.x = x;
      this.y = y;
      this.weight = weight;
    }

    GridNode.prototype.toString = function () {
      return '[' + this.x + ' ' + this.y + ']';
    };

    GridNode.prototype.getCost = function (fromNeighbor) {
      // Take diagonal weight into consideration.
      if (fromNeighbor && fromNeighbor.x !== this.x && fromNeighbor.y !== this.y) {
        return this.weight * 1.41421;
      }
      return this.weight;
    };

    GridNode.prototype.isWall = function () {
      return this.weight === 0;
    };

    function BinaryHeap (scoreFunction) {
      this.content = [];
      this.scoreFunction = scoreFunction;
    }

    BinaryHeap.prototype = {
      push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
      },
      pop: function () {
        // Store the first element so we can return it later.
        const result = this.content[0];
        // Get the element at the end of the array.
        const end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
          this.content[0] = end;
          this.bubbleUp(0);
        }
        return result;
      },
      remove: function (node) {
        const i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();

        if (i !== this.content.length - 1) {
          this.content[i] = end;

          if (this.scoreFunction(end) < this.scoreFunction(node)) {
            this.sinkDown(i);
          } else {
            this.bubbleUp(i);
          }
        }
      },
      size: function () {
        return this.content.length;
      },
      rescoreElement: function (node) {
        this.sinkDown(this.content.indexOf(node));
      },
      sinkDown: function (n) {
        // Fetch the element that has to be sunk.
        const element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {
          // Compute the parent element's index, and fetch it.
          const parentN = ((n + 1) >> 1) - 1;
          const parent = this.content[parentN];
          // Swap the elements if the parent is greater.
          if (this.scoreFunction(element) < this.scoreFunction(parent)) {
            this.content[parentN] = element;
            this.content[n] = parent;
            // Update 'n' to continue at the new position.
            n = parentN;
          } else {
            // Found a parent that is less, no need to sink any further.
            break;
          }
        }
      },
      bubbleUp: function (n) {
        // Look up the target element and its score.
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.scoreFunction(element);

        while (true) {
          // Compute the indices of the child elements.
          const child2N = (n + 1) << 1;
          const child1N = child2N - 1;
          // This is used to store the new position of the element, if any.
          let swap = null;
          let child1Score;
          // If the first child exists (is inside the array)...
          if (child1N < length) {
            // Look it up and compute its score.
            const child1 = this.content[child1N];
            child1Score = this.scoreFunction(child1);

            // If the score is less than our element's, we need to swap.
            if (child1Score < elemScore) {
              swap = child1N;
            }
          }

          // Do the same checks for the other child.
          if (child2N < length) {
            const child2 = this.content[child2N];
            const child2Score = this.scoreFunction(child2);
            if (child2Score < (swap === null ? elemScore : child1Score)) {
              swap = child2N;
            }
          }

          // If the element needs to be moved, swap it, and continue.
          if (swap !== null) {
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
          } else {
            // Otherwise, we are done.
            break;
          }
        }
      }
    };
    return { astar, Graph };
  };
  // end astar

  const all = {
    day1: {
      part1: (data) => {
        const input = data.trim().split('\n').map(r => {
          const pair = r.split('   ').map(Number);
          return pair;
        });
        console.log(input);
        const split = input.reduce((acc, pair) => {
          acc.left.push(pair[0]);
          acc.right.push(pair[1]);
          return acc;
        }, { left: [], right: [] });
        split.left.sort((a, b) => a - b);
        split.right.sort((a, b) => a - b);
        split.diff = split.left.reduce((acc, num, i) => {
          acc.push(Math.abs(num - split.right[i]));
          return acc;
        }, []);
        console.log(split);
        const sum = split.diff.reduce((acc, d) => acc + d, 0);
        return sum;
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => {
          const pair = r.split('   ').map(Number);
          return pair;
        });
        console.log(input);
        const split = input.reduce((acc, pair) => {
          acc.left.push(pair[0]);
          acc.right.push(pair[1]);
          return acc;
        }, { left: [], right: [] });
        split.scores = split.left.reduce((acc, lnum) => {
          acc.push(lnum * split.right.filter((rnum) => rnum === lnum).length);
          return acc;
        }, []);
        console.log(split);
        const sum = split.scores.reduce((acc, d) => acc + d, 0);
        return sum;
      }
    },
    day2: {
      part1: (data) => {
        const input = data.trim().split('\n').map(r => r.split(' ').map(Number)).reduce((acc, r) => {
          let ascending = 0;
          let descending = 0;
          const max = r.reduce((diff, c, i) => {
            if (i > 0) {
              const fromPrev = r[i - 1] - c;
              diff = Math.max(diff, Math.abs(fromPrev));
              const ordering = fromPrev > 0 ? 1 : fromPrev < 0 ? -1 : 0;
              if (ordering > 0) {
                ascending++;
              } else if (ordering < 0) {
                descending++;
              }
            }
            return diff;
          }, 0);
          acc.push({
            row: r,
            max,
            allMoved: (r.length - 1 === ascending + descending),
            isOrder: (ascending === 0 || descending === 0)
          });
          return acc;
        }, []);
        console.log(input);

        return input.filter(r => r.max <= 3 && r.allMoved && r.isOrder).length;
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => r.split(' ').map(Number)).reduce((acc, r) => {
          let ascending = 0;
          let descending = 0;
          const max = r.reduce((diff, c, i) => {
            if (i > 0) {
              const fromPrev = r[i - 1] - c;
              diff = Math.max(diff, Math.abs(fromPrev));
              const ordering = fromPrev > 0 ? 1 : fromPrev < 0 ? -1 : 0;
              if (ordering > 0) {
                ascending++;
              } else if (ordering < 0) {
                descending++;
              }
            }
            return diff;
          }, 0);
          acc.push({
            row: r,
            max,
            allMoved: (r.length - 1 === ascending + descending),
            isOrder: (ascending === 0 || descending === 0)
          });
          return acc;
        }, []);
        console.log(input);

        const valid = input.filter(r => r.max <= 3 && r.allMoved && r.isOrder).length;
        const second = input.filter(r => !(r.max <= 3 && r.allMoved && r.isOrder)).reduce((acc, r) => {
          for (let l = r.row.length; l--;) {
            const index = l;
            const chance = r.row.filter((_, i) => i !== index);
            let ascending = 0;
            let descending = 0;
            for (let ll = chance.length; ll--;) {
              if (ll > 0) {
                const fromPrev = chance[ll - 1] - chance[ll];
                if (Math.abs(fromPrev) <= 3) {
                  const ordering = fromPrev > 0 ? 1 : fromPrev < 0 ? -1 : 0;
                  if (ordering > 0) {
                    ascending++;
                  } else if (ordering < 0) {
                    descending++;
                  } else {
                    break;
                  }
                }
              }
            }
            if ((ascending === 0 || descending === 0) && (chance.length - 1 === ascending + descending)) {
              acc++;
              console.log(acc);
              break;
            }
          }
          return acc;
        }, 0);

        return valid + second;
      }
    },
    day3: {
      part1: (data) => {
        const rxmul = /mul\((-?\d+),(-?\d+)\)/g;
        const input = [...data.trim().matchAll(rxmul)];
        console.log(input);
        const sum = input.reduce((acc, r) => acc + r[1] * r[2], 0);
        return sum;
      },
      part2: (data) => {
        const rxmul = /mul\((-?\d+),(-?\d+)\)|(do)\(\)|(don't)\(\)/g;
        const input = [...data.trim().matchAll(rxmul)];
        console.log(input);
        let yes = true;
        const sum = input.reduce((acc, r) => {
          if (r[3] === 'do') {
            yes = true;
          } else if (r[4] === 'don\'t') {
            yes = false;
          } else if (yes) {
            acc += r[1] * r[2];
          }
          return acc;
        }, 0);
        return sum;
      }
    },
    day4: {
      part1: (data) => {
        const xmas = 'XMAS'.split('');
        const len = xmas.length;
        const input = data.trim().split('\n').map(r => r.split(''));
        const ymax = input.length;
        const xmax = input[0].length;
        console.log(input, ymax, xmax);
        let count = 0;
        for (let y = ymax; y--;) {
          const row = input[y];
          for (let x = xmax; x--;) {
            const c = row[x];
            console.log(y, x, c);
            if (c === xmas[0]) {
              const up = (y >= len - 1);
              const down = (y + len - 1 < ymax);
              const left = (x >= len - 1);
              const right = (x + len - 1 < xmax);
              console.log('up:' + up + ', down:' + down + ', left:' + left + ', right:' + right);
              // look in all possible directions
              if (up) {
                // look up
                if (input[y - 1][x] === xmas[1] && input[y - 2][x] === xmas[2] && input[y - 3][x] === xmas[3]) {
                  count++;
                }
                if (left) {
                  // look up+left
                  if (input[y - 1][x - 1] === xmas[1] && input[y - 2][x - 2] === xmas[2] && input[y - 3][x - 3] === xmas[3]) {
                    count++;
                  }
                }
                if (right) {
                  // look up+right
                  if (input[y - 1][x + 1] === xmas[1] && input[y - 2][x + 2] === xmas[2] && input[y - 3][x + 3] === xmas[3]) {
                    count++;
                  }
                }
              }
              if (left) {
                // look left
                if (input[y][x - 1] === xmas[1] && input[y][x - 2] === xmas[2] && input[y][x - 3] === xmas[3]) {
                  count++;
                }
              }
              if (right) {
                // look right
                if (input[y][x + 1] === xmas[1] && input[y][x + 2] === xmas[2] && input[y][x + 3] === xmas[3]) {
                  count++;
                }
              }
              if (down) {
                // look down
                if (input[y + 1][x] === xmas[1] && input[y + 2][x] === xmas[2] && input[y + 3][x] === xmas[3]) {
                  count++;
                }
                if (left) {
                  // look down+left
                  if (input[y + 1][x - 1] === xmas[1] && input[y + 2][x - 2] === xmas[2] && input[y + 3][x - 3] === xmas[3]) {
                    count++;
                  }
                }
                if (right) {
                  // look down+right
                  if (input[y + 1][x + 1] === xmas[1] && input[y + 2][x + 2] === xmas[2] && input[y + 3][x + 3] === xmas[3]) {
                    count++;
                  }
                }
              }
            }
          }
        }
        return count;
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => r.split(''));
        const ymax = input.length;
        const xmax = input[0].length;
        console.log(input, ymax, xmax);
        let count = 0;
        for (let y = ymax; y--;) {
          const row = input[y];
          for (let x = xmax; x--;) {
            const c = row[x];
            console.log(y, x, c);
            if (c === 'A') {
              const up = (y >= 1);
              const down = (y + 1 < ymax);
              const left = (x >= 1);
              const right = (x + 1 < xmax);
              console.log('up:' + up + ', down:' + down + ', left:' + left + ', right:' + right);
              // look in diagonals
              if (up && down && left && right) {
                // down right
                const dr = (input[y - 1][x - 1] === 'M' && input[y + 1][x + 1] === 'S');
                // down left
                const dl = (input[y - 1][x + 1] === 'M' && input[y + 1][x - 1] === 'S');
                // up right
                const ur = (input[y + 1][x - 1] === 'M' && input[y - 1][x + 1] === 'S');
                // up left
                const ul = (input[y + 1][x + 1] === 'M' && input[y - 1][x - 1] === 'S');
                // if any 2, then X
                if (dr + dl + ur + ul === 2) {
                  count++;
                }
              }
            }
          }
        }
        return count;
      }
    },
    day5: {
      part1: (data) => {
        const input = data.trim().split('\n\n');
        const topList = input[0].split('\n').map(r => r.split('|'));
        const ordering = topList.reduce((acc, r) => {
          if (!acc[r[0]]) {
            acc[r[0]] = new Set();
          }
          acc[r[0]].add(r[1]);
          return acc;
        }, {});
        const updates = input[1].split('\n').map(r => r.split(','));
        const sum = updates.reduce((acc, r) => {
          const len = r.length;
          let inOrder = true;
          let lastSet = ordering[r[0]];
          for (let i = 1; i < len; i++) {
            inOrder = inOrder && lastSet && lastSet.has(r[i]);
            if (!inOrder) {
              break;
            }
            lastSet = ordering[r[i]];
          }
          if (inOrder) {
            const mid = Math.floor(len / 2);
            acc += +r[mid];
          }
          return acc;
        }, 0);
        return sum;
      },
      part2: (data) => {
        const input = data.trim().split('\n\n');
        const topList = input[0].split('\n').map(r => r.split('|'));
        const ordering = topList.reduce((acc, r) => {
          if (!acc[r[0]]) {
            acc[r[0]] = new Set();
          }
          acc[r[0]].add(r[1]);
          return acc;
        }, {});
        const updates = input[1].split('\n').map(r => r.split(','));
        const sum = updates.reduce((acc, r) => {
          const len = r.length;
          let inOrder = true;
          let lastSet = ordering[r[0]];
          for (let i = 1; i < len; i++) {
            inOrder = inOrder && lastSet && lastSet.has(r[i]);
            if (!inOrder) {
              break;
            }
            lastSet = ordering[r[i]];
          }
          if (!inOrder) {
            // sort
            const sorted = r.sort((a, b) => {
              const aa = ordering[a];
              if (aa && aa.has(b)) {
                return -1;
              }
              return 1;
            });
            const mid = Math.floor(len / 2);
            acc += +sorted[mid];
          }
          return acc;
        }, 0);
        return sum;
      }
    },
    day6: {
      part1: d => d,
      part2: d => d
    },
    day7: {
      part1: (data) => {
        const input = data.trim().split('\n').map(r => {
          const row = r.split(':').map(p => p.trim());
          return {
            key: +row[0],
            vals: row[1].split(' ').map(Number)
          };
        });
        console.log(input);
        const ops = [
          (a, b) => a + b,
          (a, b) => a * b
        ];
        const good = [];
        for (let l = input.length; l--;) {
          const key = input[l].key;
          const vals = input[l].vals;
          const valen = vals.length;
          for (let dec = Math.pow(2, valen - 1); dec--;) {
            const bin = dec.toString(2).padStart(valen - 1, '0').split('').map(Number);
            let test = vals[0];
            for (let i = 1; i < valen; i++) {
              test = ops[bin[i - 1]](test, vals[i]);
            }
            if (key === test) {
              good.push(key);
              break;
            }
          }
        }
        const sum = good.reduce((acc, n) => acc + n, 0);
        return sum;
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => {
          const row = r.split(':').map(p => p.trim());
          return {
            key: +row[0],
            vals: row[1].split(' ').map(Number)
          };
        });
        console.log(input);
        const ops = [
          (a, b) => a + b,
          (a, b) => a * b,
          (a, b) => +(a + '' + b)
        ];
        const good = [];
        for (let l = input.length; l--;) {
          const key = input[l].key;
          const vals = input[l].vals;
          const valen = vals.length;
          for (let dec = Math.pow(3, valen - 1); dec--;) {
            const bin = dec.toString(3).padStart(valen - 1, '0').split('').map(Number);
            let test = vals[0];
            for (let i = 1; i < valen; i++) {
              test = ops[bin[i - 1]](test, vals[i]);
            }
            if (key === test) {
              good.push(key);
              break;
            }
          }
        }
        const sum = good.reduce((acc, n) => acc + n, 0);
        return sum;
      }
    },
    day8: {
      part1: (data) => {
        const ants = {};
        const output = [];
        const input = data.trim().split('\n').map((r, y) => {
          const row = r.split('');
          const o = [];
          row.forEach((c, x) => {
            if (c !== '.') {
              ants[c] = ants[c] || [];
              ants[c].push({ y, x });
            }
            o.push('.');
          });
          output.push(o);
          return row;
        });
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        console.log(ants, input, ymax, xmax);
        const anti = [];
        Object.keys(ants).forEach(a => {
          console.log('antenna ' + a);
          const aa = ants[a];
          const len = aa.length;
          aa.forEach((p1, i) => {
            // compare each remaining points
            for (let j = i + 1; j < len; j++) {
              const p2 = aa[j];
              const dy = p2.y - p1.y;
              const dx = p2.x - p1.x;
              const anti1 = { a, y: p1.y - dy, x: p1.x - dx };
              const anti2 = { a, y: p2.y + dy, x: p2.x + dx };
              if (inRange(anti1)) {
                anti.push(anti1);
                output[anti1.y][anti1.x] = '#';
              }
              if (inRange(anti2)) {
                anti.push(anti2);
                output[anti2.y][anti2.x] = '#';
              }
            }
          });
        });
        const mapped = output.map(r => r.join('')).join('\n');
        console.log('antinodes:\n' + mapped);
        return mapped.match(/#/g).length;
      },
      part2: (data) => {
        const ants = {};
        const output = [];
        const input = data.trim().split('\n').map((r, y) => {
          const row = r.split('');
          const o = [];
          row.forEach((c, x) => {
            if (c !== '.') {
              ants[c] = ants[c] || [];
              ants[c].push({ y, x });
            }
            o.push('.');
          });
          output.push(o);
          return row;
        });
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        console.log(ants, input, ymax, xmax);
        const anti = [];
        Object.keys(ants).forEach(a => {
          console.log('antenna ' + a);
          const aa = ants[a];
          const len = aa.length;
          if (len > 1) {
            aa.forEach((p1, i) => {
              output[p1.y][p1.x] = '#';
              // compare each remaining points
              for (let j = i + 1; j < len; j++) {
                const p2 = aa[j];
                const dy = p2.y - p1.y;
                const dx = p2.x - p1.x;
                let anti1 = { a, y: p1.y - dy, x: p1.x - dx };
                let anti2 = { a, y: p2.y + dy, x: p2.x + dx };
                while (inRange(anti1)) {
                  anti.push(anti1);
                  output[anti1.y][anti1.x] = '#';
                  anti1 = { a, y: anti1.y - dy, x: anti1.x - dx };
                }
                while (inRange(anti2)) {
                  anti.push(anti2);
                  output[anti2.y][anti2.x] = '#';
                  anti2 = { a, y: anti2.y + dy, x: anti2.x + dx };
                }
              }
            });
          }
        });
        const mapped = output.map(r => r.join('')).join('\n');
        console.log(anti.length, 'antinodes:\n' + mapped);
        // 1042 is too low
        // 1230 is too high
        return mapped.match(/#/g).length;
      }
    },
    day9: {
      part1: (data) => {
        let fileNum = 0;
        const files = [];
        const input = data.trim().split('').map((c, i) => {
          const block = {
            startIndex: i,
            isSpace: i % 2,
            size: +c
          };
          if (!block.isSpace) {
            block.fileIndex = fileNum++;
            files.push(block);
          }
          return block;
        });
        console.log(input, files);
        const disk = input.reduce((acc, b) => {
          for (let l = b.size; l--;) {
            acc.push(b.isSpace ? '.' : b.fileIndex);
          }
          return acc;
        }, []);
        console.log(disk, disk.join(''));
        for (let l = disk.length; l--;) {
          const c = disk[l];
          if (c !== '.') {
            const free = disk.indexOf('.');
            if (free < l) {
              disk[l] = '.';
              disk[free] = c;
            } else {
              break;
            }
          }
        }
        console.log(disk, disk.join(''));
        const checksum = disk.reduce((sum, c, i) => {
          if (c !== '.') {
            sum += (i * c);
          }
          return sum;
        }, 0);
        return checksum;
      },
      part2: (data) => {
        let fileNum = 0;
        const files = [];
        const input = data.trim().split('').map((c, i) => {
          const block = {
            startIndex: i,
            isSpace: i % 2,
            size: +c
          };
          if (!block.isSpace) {
            block.fileIndex = fileNum++;
            files.push(block);
          }
          return block;
        });
        console.log(input, files);
        const disk = input.reduce((acc, b) => {
          for (let l = b.size; l--;) {
            acc.push(b.isSpace ? '.' : b.fileIndex);
          }
          return acc;
        }, []);
        console.log(disk, disk.join(''));
        const findFree = () => {
          let freeIndex = -1;
          let lastFreeStart = -1;
          return disk.reduce((acc, c, i) => {
            if (c === '.') {
              if (lastFreeStart === -1) {
                lastFreeStart = i;
                acc.push({
                  start: i,
                  freeLength: 0
                });
                freeIndex++;
              }
              acc[freeIndex].freeLength++;
            } else {
              lastFreeStart = -1;
            }
            return acc;
          }, []);
        };
        console.log(findFree());
        for (let l = disk.length; l--;) {
          const c = disk[l];
          // console.log(l, c);
          if (c !== '.') {
            const file = files[c];
            const free = findFree();
            const firstFree = free.find(f => f.freeLength >= file.size);
            // console.log(file, firstFree);
            if (firstFree) {
              let newStart = firstFree.start;
              if (newStart < l) {
                // move file
                for (let ll = file.size; ll--;) {
                  disk[newStart++] = c;
                  disk[l--] = '.';
                }
                l++;
              } else {
                // console.log('space is to right, going from ' + l);
                l -= (file.size - 1);
                // console.log('to ' + l);
              }
            } else {
              // console.log('no space, going from ' + l);
              l -= (file.size - 1);
              // console.log('to ' + l);
            }
          }
        }
        console.log(disk, disk.join(''));
        const checksum = disk.reduce((sum, c, i) => {
          if (c !== '.') {
            sum += (i * c);
          }
          return sum;
        }, 0);
        // 6717067113048 is too high
        return checksum;
      }
    },
    day10: {
      part1: (data) => {
        const input = data.trim().split('\n').map(r => r.split('').map(Number));
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        const starts = [];
        input.forEach((r, y) => {
          r.forEach((c, x) => {
            if (c === 0) {
              starts.push({ c, y, x, s: 0, last: [] });
            }
          });
        });
        console.log(input, ymax, xmax, starts);
        const hike = (p, o) => {
          if (p.c === 9) {
            if (!starts[o].last.some(pp => p.y === pp.y && p.x === pp.x)) {
              starts[o].s++;
              starts[o].last.push(p);
            }
            return;
          }
          const nextVal = p.c + 1;
          const n = { y: p.y - 1, x: p.x, c: nextVal };
          const e = { y: p.y, x: p.x + 1, c: nextVal };
          const s = { y: p.y + 1, x: p.x, c: nextVal };
          const w = { y: p.y, x: p.x - 1, c: nextVal };
          if (inRange(n) && input[n.y][n.x] === nextVal) {
            hike(n, o);
          }
          if (inRange(e) && input[e.y][e.x] === nextVal) {
            hike(e, o);
          }
          if (inRange(s) && input[s.y][s.x] === nextVal) {
            hike(s, o);
          }
          if (inRange(w) && input[w.y][w.x] === nextVal) {
            hike(w, o);
          }
        };
        starts.forEach((p, i) => {
          hike(p, i);
        });
        return starts.reduce((sum, p) => sum + p.s, 0);
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => r.split('').map(Number));
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        const starts = [];
        input.forEach((r, y) => {
          r.forEach((c, x) => {
            if (c === 0) {
              starts.push({ c, y, x, s: 0 });
            }
          });
        });
        console.log(input, ymax, xmax, starts);
        const hike = (p, o) => {
          if (p.c === 9) {
            starts[o].s++;
            return;
          }
          const nextVal = p.c + 1;
          const n = { y: p.y - 1, x: p.x, c: nextVal };
          const e = { y: p.y, x: p.x + 1, c: nextVal };
          const s = { y: p.y + 1, x: p.x, c: nextVal };
          const w = { y: p.y, x: p.x - 1, c: nextVal };
          if (inRange(n) && input[n.y][n.x] === nextVal) {
            hike(n, o);
          }
          if (inRange(e) && input[e.y][e.x] === nextVal) {
            hike(e, o);
          }
          if (inRange(s) && input[s.y][s.x] === nextVal) {
            hike(s, o);
          }
          if (inRange(w) && input[w.y][w.x] === nextVal) {
            hike(w, o);
          }
        };
        starts.forEach((p, i) => {
          hike(p, i);
        });
        return starts.reduce((sum, p) => sum + p.s, 0);
      }
    },
    day11: {
      part1: (data) => {
        const input = data.trim().split(' ').map(Number);
        const ymax = input.length;
        console.log(input, ymax);
        const process = n => {
          if (n === 0) {
            return [1];
          } else {
            const sn = n + '';
            if (sn.length % 2 === 0) {
              const half = sn.length / 2;
              const arr = sn.split('');
              return [+arr.slice(0, half).join(''), +arr.slice(-half).join('')];
            } else {
              return [n * 2024];
            }
          }
        };
        let newVals = input;
        for (let l = 25; l--;) {
          newVals = newVals.reduce((acc, n) => {
            acc.push(...process(n));
            return acc;
          }, []);
        }
        console.log(newVals);
        return newVals.length;
      },
      part2: (data) => {
        let input = data.trim().split(' ').map(Number).reduce((acc, n) => {
          if (!acc[n]) {
            acc[n] = 1;
          } else {
            acc[n]++;
          }
          return acc;
        }, {});
        console.log(input);
        const process = n => {
          if (n === 0) {
            return [1];
          } else {
            const sn = n + '';
            if (sn.length % 2 === 0) {
              const half = sn.length / 2;
              const arr = sn.split('');
              return [+arr.slice(0, half).join(''), +arr.slice(-half).join('')];
            } else {
              return [n * 2024];
            }
          }
        };
        for (let i = 1; i <= 75; i++) {
          console.time('part 2, ' + i);
          const newInput = {};
          Object.keys(input).forEach(k => {
            const val = input[k];
            if (val) {
              const processed = process(+k);
              processed.forEach(n => {
                if (!newInput[n]) {
                  newInput[n] = val;
                } else {
                  newInput[n] += val;
                }
              });
            }
          });
          input = newInput;
          // console.log(Object.keys(input).filter(k => input[k] > 0));
          console.timeEnd('part 2, ' + i);
        }
        const sum = Object.keys(input).filter(k => input[k] > 0).reduce((acc, n) => acc + input[n], 0);
        return sum;
      }
    },
    day12: {
      part1: (data) => {
        const input = data.trim().split('\n').map(r => r.split(''));
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        const max = ymax * xmax;
        const shapes = input.reduce((acc, r, y) => {
          r.forEach((c, x) => {
            const point = {
              c,
              y,
              x,
              f: { /* n: 0, e: 0, s: 0, w: 0 */ }
            };
            const dirs = [
              { d: 'n', y: y - 1, x },
              { d: 'e', y, x: x + 1 },
              { d: 's', y: y + 1, x },
              { d: 'w', y, x: x - 1 }
            ];
            dirs.forEach(dir => {
              if (inRange(dir) && input[dir.y][dir.x] === c) {
                point.f[dir.d] = false;
              } else {
                point.f[dir.d] = true;
              }
            });
            acc[y + ',' + x] = point;
          });
          return acc;
        }, {});
        console.log(input, ymax, xmax, max, shapes);
        const look = (p, skip) => {
          skip.push(p);
          const dirs = [
            { d: 'n', y: p.y - 1, x: p.x },
            { d: 'e', y: p.y, x: p.x + 1 },
            { d: 's', y: p.y + 1, x: p.x },
            { d: 'w', y: p.y, x: p.x - 1 }
          ];
          dirs.forEach(dir => {
            if (inRange(dir) && input[dir.y][dir.x] === p.c && !skip.some(s => s.y === dir.y && s.x === dir.x)) {
              look(shapes[dir.y + ',' + dir.x], skip);
            }
          });
          return skip;
        };
        const found = [];
        const processed = [];
        Object.keys(shapes).forEach(k => {
          if (!processed.includes(k)) {
            const shapePoints = look(shapes[k], []);
            found.push(shapePoints);
            processed.push(...shapePoints.map(p => p.y + ',' + p.x));
          }
        });
        console.log(found, processed);
        const price = found.reduce((acc, region) => {
          const area = region.length;
          const fence = region.reduce((acc2, p) => acc2 + p.f.n + p.f.e + p.f.s + p.f.w, 0);
          return acc + (area * fence);
        }, 0);
        return price;
      },
      part2: (data) => {
        const input = data.trim().split('\n').map(r => r.split(''));
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;
        const max = ymax * xmax;
        const shapes = input.reduce((acc, r, y) => {
          r.forEach((c, x) => {
            const point = {
              c,
              y,
              x,
              f: { /* n: 0, e: 0, s: 0, w: 0 */ }
            };
            const dirs = [
              { d: 'n', y: y - 1, x },
              { d: 'e', y, x: x + 1 },
              { d: 's', y: y + 1, x },
              { d: 'w', y, x: x - 1 }
            ];
            dirs.forEach(dir => {
              if (inRange(dir) && input[dir.y][dir.x] === c) {
                point.f[dir.d] = false;
              } else {
                point.f[dir.d] = true;
              }
            });
            acc[y + ',' + x] = point;
          });
          return acc;
        }, {});
        console.log(input, ymax, xmax, max, shapes);
        const look = (p, skip) => {
          skip.push(p);
          const dirs = [
            { d: 'n', y: p.y - 1, x: p.x },
            { d: 'e', y: p.y, x: p.x + 1 },
            { d: 's', y: p.y + 1, x: p.x },
            { d: 'w', y: p.y, x: p.x - 1 }
          ];
          dirs.forEach(dir => {
            if (inRange(dir) && input[dir.y][dir.x] === p.c && !skip.some(s => s.y === dir.y && s.x === dir.x)) {
              look(shapes[dir.y + ',' + dir.x], skip);
            }
          });
          return skip;
        };
        const found = [];
        const processed = [];
        Object.keys(shapes).forEach(k => {
          if (!processed.includes(k)) {
            const shapePoints = look(shapes[k], []);
            found.push(shapePoints);
            processed.push(...shapePoints.map(p => p.y + ',' + p.x));
          }
        });
        console.log(found, processed);
        const price = found.reduce((acc, region) => {
          const area = region.length;
          let sides = 0;
          let ncount = 0;
          let scount = 0;
          for (let y = 0; y < ymax; y++) {
            let xnlast = -2;
            let xslast = -2;
            for (let x = 0; x < xmax; x++) {
              // count N && S sides
              const found = region.find(p => p.y === y && p.x === x);
              if (found && found.f.n) {
                if (x - xnlast >= 2) {
                  ncount++;
                }
                xnlast = x;
              }
              if (found && found.f.s) {
                if (x - xslast >= 2) {
                  scount++;
                }
                xslast = x;
              }
            }
          }
          sides += ncount + scount;
          let ecount = 0;
          let wcount = 0;
          for (let x = 0; x < xmax; x++) {
            let yelast = -2;
            let ywlast = -2;
            for (let y = 0; y < ymax; y++) {
              // count E && W sides
              const found = region.find(p => p.y === y && p.x === x);
              if (found && found.f.e) {
                if (y - yelast >= 2) {
                  ecount++;
                }
                yelast = y;
              }
              if (found && found.f.w) {
                if (y - ywlast >= 2) {
                  wcount++;
                }
                ywlast = y;
              }
            }
          }
          sides += ecount + wcount;
          return acc + (area * sides);
        }, 0);
        return price;
      }
    },
    day13: {
      part1: (data) => {
        const matchButtons = /X\+(\d+), Y\+(\d+)/;
        const matchPrize = /X=(\d+), Y=(\d+)/;
        let sum = 0;
        const input = data.trim().split('\n\n').map(r => {
          const claw = r.split('\n');
          const buttonA = claw[0].match(matchButtons);
          const buttonB = claw[1].match(matchButtons);
          const prize = claw[2].match(matchPrize);
          const game = {
            a: {
              x: +buttonA[1],
              y: +buttonA[2]
            },
            b: {
              x: +buttonB[1],
              y: +buttonB[2]
            },
            p: {
              x: +prize[1],
              y: +prize[2]
            }
          };
          // start at max B value
          for (let b = 100; b--;) {
            const bx = b * game.b.x;
            if (bx <= game.p.x) {
              const by = b * game.b.y;
              if (by <= game.p.y) {
                // remainder after B value
                const rx = game.p.x - bx;
                if (rx % game.a.x === 0) {
                  const ry = game.p.y - by;
                  if (ry % game.a.y === 0) {
                    // check A values are equal
                    const axv = rx / game.a.x;
                    const ayv = ry / game.a.y;
                    if (axv === ayv) {
                      game.p.b = b;
                      game.p.a = axv;
                      game.p.t = (axv * 3) + b;
                      sum += game.p.t;
                      break;
                    }
                  }
                }
              }
            }
          }
          return game;
        });
        console.log(input, sum);
        return sum;
      },
      part2: (data) => {
        const matchButtons = /X\+(\d+), Y\+(\d+)/;
        const matchPrize = /X=(\d+), Y=(\d+)/;
        const input = data.trim().split(/\r?\n\r?\n/).map(r => {
          const claw = r.split(/\r?\n/);
          const buttonA = claw[0].match(matchButtons);
          const buttonB = claw[1].match(matchButtons);
          const prize = claw[2].match(matchPrize);
          const game = {
            a: {
              x: +buttonA[1],
              y: +buttonA[2]
            },
            b: {
              x: +buttonB[1],
              y: +buttonB[2]
            },
            p: {
              x: +prize[1] + 10000000000000,
              y: +prize[2] + 10000000000000
            }
          };
          return game;
        });
        const ymax = input.length;
        console.log(input, ymax);
        const sum = input.reduce((acc, game, i) => {
          // start at max B value
          const bmax = Math.floor(Math.min(game.p.x / game.b.x, game.p.y / game.b.y)) + 1;
          const percentage = bmax / 100;
          let last = bmax;
          let percent = 100;
          console.log('processing ' + (i + 1) + ' of ' + ymax + ', counting down from ' + bmax);
          for (let b = bmax; b--;) {
            const bx = b * game.b.x;
            if (bx <= game.p.x) {
              const by = b * game.b.y;
              if (by <= game.p.y) {
                // remainder after B value
                const rx = game.p.x - bx;
                if (rx % game.a.x === 0) {
                  const ry = game.p.y - by;
                  if (ry % game.a.y === 0) {
                    // check A values are equal
                    const axv = rx / game.a.x;
                    const ayv = ry / game.a.y;
                    if (axv === ayv) {
                      game.p.b = b;
                      game.p.a = axv;
                      game.p.t = (axv * 3) + b;
                      acc += game.p.t;
                      console.log(acc, game.p.t);
                      break;
                    }
                  }
                }
              }
            }
            if (b < last) {
              console.log((100 - percent) + '%');
              last -= percentage;
              percent--;
            }
          }
          return acc;
        }, 0);
        return sum;
      }
    },
    day14: {
      part1: (data) => {
        const matchpv = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
        const input = data.trim().split(/\r?\n/).map(r => {
          const m = r.match(matchpv);
          return {
            p: { x: +m[1], y: +m[2] },
            v: { x: +m[3], y: +m[4] }
          };
        });
        const ymax = 103;
        const xmax = 101;
        const space = [];
        for (let y = ymax; y--;) {
          const row = [];
          for (let x = xmax; x--;) {
            row.push('.');
          }
          space.push(row);
        }
        console.log(input, space);
        const move = (s) => {
          const sx = s.p.x;
          const sy = s.p.y;
          const dx = s.v.x;
          const dy = s.v.y;
          let nx = sx + dx;
          if (nx >= xmax) {
            nx = nx % xmax;
          } else if (nx < 0) {
            nx = xmax + (nx % xmax);
          }
          let ny = sy + dy;
          if (ny >= ymax) {
            ny = ny % ymax;
          } else if (ny < 0) {
            ny = ymax + (ny % ymax);
          }
          s.p.x = nx;
          s.p.y = ny;
          return s;
        };
        for (let ll = input.length; ll--;) {
          let robot = input[ll];
          for (let l = 100; l--;) {
            robot = move(robot);
            input[ll] = robot;
          }
          if (space[robot.p.y][robot.p.x] === '.') {
            space[robot.p.y][robot.p.x] = 1;
          } else {
            space[robot.p.y][robot.p.x]++;
          }
        }
        console.log('\n' + space.map(r => r.join('')).join('\n'));
        const halfx = Math.floor(xmax / 2);
        const upperhalfx = xmax - halfx;
        const halfy = Math.floor(ymax / 2);
        const upperhalfy = ymax - halfy;
        const quads = input.reduce((acc, r) => {
          if (r.p.x < halfx && r.p.y < halfy) {
            acc[0]++;
          }
          if (r.p.x >= upperhalfx && r.p.y < halfy) {
            acc[1]++;
          }
          if (r.p.x < halfx && r.p.y >= upperhalfy) {
            acc[2]++;
          }
          if (r.p.x >= upperhalfx && r.p.y >= upperhalfy) {
            acc[3]++;
          }
          return acc;
        }, [0, 0, 0, 0]);
        console.log(quads);
        const safety = quads.reduce((acc, f) => acc * f, 1);
        return safety;
      },
      part2: (data) => {
        const matchpv = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
        const input = data.trim().split(/\r?\n/).map(r => {
          const m = r.match(matchpv);
          return {
            p: { x: +m[1], y: +m[2] },
            v: { x: +m[3], y: +m[4] }
          };
        });
        const ymax = 103;
        const xmax = 101;
        console.log(input);
        const move = (s) => {
          const sx = s.p.x;
          const sy = s.p.y;
          const dx = s.v.x;
          const dy = s.v.y;
          let nx = sx + dx;
          if (nx >= xmax) {
            nx = nx % xmax;
          } else if (nx < 0) {
            nx = xmax + (nx % xmax);
          }
          let ny = sy + dy;
          if (ny >= ymax) {
            ny = ny % ymax;
          } else if (ny < 0) {
            ny = ymax + (ny % ymax);
          }
          s.p.x = nx;
          s.p.y = ny;
          return s;
        };
        for (let cycles = 0; cycles < 10000; cycles++) {
          const clone = JSON.parse(JSON.stringify(input));
          const space = [];
          for (let y = ymax; y--;) {
            const row = [];
            for (let x = xmax; x--;) {
              row.push('.');
            }
            space.push(row);
          }
          for (let ll = clone.length; ll--;) {
            let robot = clone[ll];
            for (let l = cycles; l--;) {
              robot = move(robot);
              clone[ll] = robot;
            }
            if (space[robot.p.y][robot.p.x] === '.') {
              space[robot.p.y][robot.p.x] = 1;
            } else {
              space[robot.p.y][robot.p.x]++;
            }
          }
          if (new Set(space.map(r => r.join('')).join('')).size === 2) {
            console.log(cycles + '\n' + space.map(r => r.join('')).join('\n'));
          }
        }
        return 'look in console';
      }
    },
    day15: {
      part1: (data) => {
        const input = data.trim().split(/\r?\n\r?\n/);
        const dir = {
          '^': { dy: -1, dx: 0 },
          '>': { dy: 0, dx: 1 },
          v: { dy: 1, dx: 0 },
          '<': { dy: 0, dx: -1 }
        };
        let start = { y: -1, x: -1 };
        const map = input[0].trim().split(/\r?\n/).map((r, y) => {
          const row = r.split('');
          const x = row.indexOf('@');
          if (x >= 0) {
            start = { y, x };
          }
          return row;
        });
        const moves = input[1].trim().replace(/\r|\n/g, '').split('');
        console.log(map, moves, start);
        const lookDir = (p, m) => {
          const adjust = dir[m];
          const lookPos = { adjust, y: p.y + adjust.dy, x: p.x + adjust.dx };
          const lookChar = map[lookPos.y][lookPos.x];
          if (lookChar === '.') {
            return lookPos;
          } else if (lookChar === '#') {
            return false;
          } else {
            return lookDir(lookPos, m);
          }
        };
        const movemax = moves.length;
        console.log('start:\n' + map.map(r => r.join('')).join('\n'));
        moves.forEach((m, i) => {
          console.log('moving ' + m + ' ' + i + ' of ' + movemax, 'start', start);
          const dot = lookDir(start, m);
          if (dot) {
            let last = { y: dot.y, x: dot.x };
            console.log('shifting from', dot, 'to', start, last.x !== start.x, last.y !== start.y);
            while (last.x !== start.x || last.y !== start.y) {
              const next = { y: last.y - dot.adjust.dy, x: last.x - dot.adjust.dx };
              map[last.y][last.x] = map[next.y][next.x];
              // console.log('last', last, 'next', next);
              if (next.x !== start.x || next.y !== start.y) {
                last = next;
              } else {
                break;
              }
            }
            map[start.y][start.x] = '.';
            start = last;
          }
          // console.log('new start', start, '\n' + map.map(r => r.join('')).join('\n'));
        });
        const sum = map.reduce((acc, row, y) => {
          row.forEach((c, x) => {
            if (c === 'O') {
              acc += (100 * y) + x;
            }
          });
          return acc;
        }, 0);
        console.log('end:\n' + map.map(r => r.join('')).join('\n'));
        return sum;
      },
      part2: (data) => {
        const input = data.trim().split(/\r?\n\r?\n/);
        const dir = {
          '^': { dy: -1, dx: 0 },
          '>': { dy: 0, dx: 1 },
          v: { dy: 1, dx: 0 },
          '<': { dy: 0, dx: -1 }
        };
        let start = { y: -1, x: -1 };
        const map = input[0].trim().replace(/#/g, '##').replace(/O/g, '[]').replace(/\./g, '..').replace(/@/g, '@.').split(/\r?\n/).map((r, y) => {
          const row = r.split('');
          const x = row.indexOf('@');
          if (x >= 0) {
            start = { y, x };
          }
          return row;
        });
        const moves = input[1].trim().replace(/\r|\n/g, '').split('');
        console.log(map, moves, start);
        const lookXDir = (p, m) => {
          const adjust = dir[m];
          const lookPos = { adjust, y: p.y + adjust.dy, x: p.x + adjust.dx };
          const lookChar = map[lookPos.y][lookPos.x];
          if (lookChar === '.') {
            return lookPos;
          } else if (lookChar === '#') {
            return false;
          } else {
            return lookXDir(lookPos, m);
          }
        };
        const lookYDir = (toMove, m) => {
          const adjust = dir[m];
          let yval = -1;
          if (m === '^') {
            yval = Math.min(...toMove.map(s => s.y));
          } else if (m === 'v') {
            yval = Math.max(...toMove.map(s => s.y));
          }
          // console.log('m', m, 'y', yval);
          const end = toMove.filter(s => s.y === yval);
          let allEmpty = true;
          for (let l = end.length; l--;) {
            const s = end[l];
            const look = { y: s.y + adjust.dy, x: s.x + adjust.dx };
            if (!toMove.some(any => any.y === look.y && any.x === look.x)) {
              const lookChar = map[look.y][look.x];
              if (lookChar === '#') {
                // a shape hit a wall, can't move
                toMove = [];
                allEmpty = false;
                return false;
              } else if (lookChar === '.') {
                allEmpty = allEmpty && true;
              } else if (lookChar === '[') {
                allEmpty = false;
                toMove.push(look);
                toMove.push({ y: look.y, x: look.x + 1 });
              } else if (lookChar === ']') {
                allEmpty = false;
                toMove.push(look);
                toMove.push({ y: look.y, x: look.x - 1 });
              }
            }
          }
          if (allEmpty) {
            return toMove;
          } else {
            return lookYDir(toMove, m);
          }
        };
        const movemax = moves.length;
        console.log('start:\n' + map.map(r => r.join('')).join('\n'));
        moves.forEach((m, i) => {
          console.log('moving ' + m + ' ' + i + ' of ' + movemax, 'start', start);
          // moving horizontal is the same
          if (m === '<' || m === '>') {
            const dot = lookXDir(start, m);
            if (dot) {
              let last = { y: dot.y, x: dot.x };
              console.log('shifting from', dot, 'to', start, last.x !== start.x, last.y !== start.y);
              while (last.x !== start.x || last.y !== start.y) {
                const next = { y: last.y - dot.adjust.dy, x: last.x - dot.adjust.dx };
                map[last.y][last.x] = map[next.y][next.x];
                // console.log('last', last, 'next', next);
                if (next.x !== start.x || next.y !== start.y) {
                  last = next;
                } else {
                  break;
                }
              }
              map[start.y][start.x] = '.';
              start = last;
            }
          } else if (m === '^' || m === 'v') {
            // moving vertical is tricky
            const adjust = dir[m];
            const shapes = lookYDir([start], m);
            console.log('shifting start:', start, 'shapes:', shapes);
            if (shapes && shapes.length > 0) {
              for (let l = shapes.length; l--;) {
                const shape = shapes[l];
                const char = map[shape.y][shape.x];
                const moved = { y: shape.y + adjust.dy, x: shape.x + adjust.dx };
                // console.log(shape, char, moved);
                map[moved.y][moved.x] = char;
                map[shape.y][shape.x] = '.';
                if (char === '@') {
                  start = moved;
                }
              }
            }
          }
          // console.log('new start', start, '\n' + map.map(r => r.join('')).join('\n'));
        });
        const sum = map.reduce((acc, row, y) => {
          row.forEach((c, x) => {
            if (c === '[') {
              acc += (100 * y) + x;
            }
          });
          return acc;
        }, 0);
        console.log('end:\n' + map.map(r => r.join('')).join('\n'));
        return sum;
      }
    },
    day16: {
      part1: d => d,
      part2: d => d
    },
    day17: {
      part1: (data) => {
        const input = data.trim().split(/\r?\n\r?\n/);
        const reg = input[0].split(/\r?\n/).map(r => +r.split(':')[1].trim());
        const prog = input[1].split(' ')[1].split(',').map(Number);
        console.log(input, reg, prog);
        const combo = n => {
          if (n >= 0 && n <= 3) {
            return n;
          } else if (n === 4) {
            // A
            return reg[0];
          } else if (n === 5) {
            // B
            return reg[1];
          } else if (n === 6) {
            // C
            return reg[2];
          }
        };
        const output = [];
        const op = (code, operand, point) => {
          switch (code) {
            case 0: // adv
              reg[0] = Math.floor(reg[0] / Math.pow(2, combo(operand)));
              break;
            case 1: // bxl
              reg[1] = reg[1] ^ operand;
              break;
            case 2: // bst
              reg[1] = combo(operand) % 8;
              break;
            case 3: // jnz
              if (reg[0] !== 0) {
                if (point === operand) {
                  point -= 2;
                } else {
                  point = operand - 2;
                }
              }
              break;
            case 4: // bxc
              reg[1] = reg[1] ^ reg[2];
              break;
            case 5: // out
              output.push(combo(operand) % 8);
              break;
            case 6: // bdv
              reg[1] = reg[0] / Math.pow(2, combo(operand));
              break;
            case 7: // cdv
              reg[2] = reg[0] / Math.pow(2, combo(operand));
              break;
          }
          return point;
        };
        const len = prog.length;
        let safety = 1000;
        for (let i = 0; i < len; i += 2) {
          // console.log(i, prog[i], prog[i + 1], reg.join(','), output.join(','));
          i = op(prog[i], prog[i + 1], i);
          if (safety-- <= 0) {
            console.warn('safety hit!');
            break;
          }
        }
        console.log(output.join(','));
        // not 3
        return output.join(',');
      },
      part2: (data) => {
        const input = data.trim().split(/\r?\n\r?\n/);
        let reg = [0, 0, 0];
        const prog = input[1].split(' ')[1].split(',').map(Number);
        const start = prog.join(',');
        console.log(input, reg, prog);
        const combo = n => {
          if (n >= 0 && n <= 3) {
            return n;
          } else if (n === 4) {
            // A
            return reg[0];
          } else if (n === 5) {
            // B
            return reg[1];
          } else if (n === 6) {
            // C
            return reg[2];
          }
        };
        const op = (code, operand, point, output) => {
          switch (code) {
            case 0: // adv
              reg[0] = Math.floor(reg[0] / Math.pow(2, combo(operand)));
              break;
            case 1: // bxl
              reg[1] = reg[1] ^ operand;
              break;
            case 2: // bst
              reg[1] = combo(operand) % 8;
              break;
            case 3: // jnz
              if (reg[0] !== 0) {
                if (point === operand) {
                  point -= 2;
                } else {
                  point = operand - 2;
                }
              }
              break;
            case 4: // bxc
              reg[1] = reg[1] ^ reg[2];
              break;
            case 5: // out
              output.push(combo(operand) % 8);
              break;
            case 6: // bdv
              reg[1] = reg[0] / Math.pow(2, combo(operand));
              break;
            case 7: // cdv
              reg[2] = reg[0] / Math.pow(2, combo(operand));
              break;
          }
          return point;
        };
        let result = -1;
        const min = 10000000000;
        const max = 50000000000;
        const pct = (max - min) / 100;
        let percent = 0;
        let progress = min;
        for (let iter = min; iter < max; iter++) {
          reg = [iter, 0, 0];
          const output = [];
          const len = prog.length;
          let safety = 1000;
          for (let i = 0; i < len; i += 2) {
            // console.log(i, prog[i], prog[i + 1], reg.join(','), output.join(','));
            i = op(prog[i], prog[i + 1], i, output);
            if (safety-- <= 0) {
              console.warn('safety hit!');
              break;
            }
          }
          const end = output.join(',');
          if (start === end) {
            result = iter;
            break;
          }
          if (iter > progress) {
            console.log(percent + '%');
            progress += pct;
            percent++;
          }
        }
        return result;
      }
    },
    day18: {
      part1: (data) => {
        const input = data.trim().split(/\r?\n/).map(r => r.split(',').map(Number));
        const gridsize = 71;
        const grid = [];
        for (let y = gridsize; y--;) {
          const row = [];
          for (let x = gridsize; x--;) {
            row.push(1);
          }
          grid.push(row);
        }
        console.log(input, grid);
        const simulate = 1024;
        for (let i = simulate; i--;) {
          const m = input[i];
          // console.log(m);
          grid[m[1]][m[0]] = 0;
        }
        console.log(grid.map(r => r.map(c => c ? '.' : '#').join('')).join('\n'));
        const as = astar();
        const g = new as.Graph(grid);
        const start = g.grid[0][0];
        const end = g.grid[gridsize - 1][gridsize - 1];
        console.log(g, start, end);
        const result = as.astar.search(g, start, end);
        console.log(result);
        return result.length;
      },
      part2: (data) => {
        const input = data.trim().split(/\r?\n/).map(r => r.split(',').map(Number));
        const gridsize = 71;
        const grid = [];
        for (let y = gridsize; y--;) {
          const row = [];
          for (let x = gridsize; x--;) {
            row.push(1);
          }
          grid.push(row);
        }
        console.log(input, grid);
        const minsimulate = 1024;
        const maxlen = input.length;
        let block = [-1, -1];
        for (let simulate = minsimulate; simulate < maxlen; simulate++) {
          for (let i = simulate; i--;) {
            const m = input[i];
            // console.log(m);
            grid[m[1]][m[0]] = 0;
          }
          // console.log(grid.map(r => r.map(c => c ? '.' : '#').join('')).join('\n'));
          const as = astar();
          const g = new as.Graph(grid);
          const start = g.grid[0][0];
          const end = g.grid[gridsize - 1][gridsize - 1];
          // console.log(g, start, end);
          const result = as.astar.search(g, start, end);
          console.log(simulate, result.length);
          if (result.length === 0) {
            block = input[simulate - 1];
            break;
          }
        }
        console.log(block);
        // not 57,32
        return block.join(',');
      }
    },
    day19: {
      part1: (data) => {
        const input = data.trim().split(/\r?\n\r?\n/);
        const patterns = new RegExp('^(' + input[0].split(',').sort((a, b) => b.length - a.length).map(s => s.trim()).join('|') + ')+$');
        const designs = input[1].split(/\r?\n/);
        console.log(patterns, designs);
        let count = 0;
        designs.forEach(d => {
          if (patterns.test(d)) {
            count++;
          }
        });
        // not 25
        return count;
      },
      part2: d => d
    },
    day20: {
      part1: d => d,
      part2: d => d
    },
    day21: {
      part1: d => d,
      part2: d => d
    },
    day22: {
      part1: d => d,
      part2: d => d
    },
    day23: {
      part1: d => d,
      part2: d => d
    },
    day24: {
      part1: d => d,
      part2: d => d
    },
    day25: {
      part1: d => d,
      part2: d => d
    }
  };

  this.funs = (day, part) => all['day' + day]['part' + part];
}.call(this));
