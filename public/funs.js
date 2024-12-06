(function () {
  'use strict';

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
      part1: d => d,
      part2: d => d
    },
    day8: {
      part1: d => d,
      part2: d => d
    },
    day9: {
      part1: d => d,
      part2: d => d
    },
    day10: {
      part1: d => d,
      part2: d => d
    },
    day11: {
      part1: d => d,
      part2: d => d
    },
    day12: {
      part1: d => d,
      part2: d => d
    },
    day13: {
      part1: d => d,
      part2: d => d
    },
    day14: {
      part1: d => d,
      part2: d => d
    },
    day15: {
      part1: d => d,
      part2: d => d
    },
    day16: {
      part1: d => d,
      part2: d => d
    },
    day17: {
      part1: d => d,
      part2: d => d
    },
    day18: {
      part1: d => d,
      part2: d => d
    },
    day19: {
      part1: d => d,
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
