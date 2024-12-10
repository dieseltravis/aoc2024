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
      part1: (data) => {
        const guard = {
          '^': { dy: -1, dx: 0 },
          '>': { dy: 0, dx: 1 },
          v: { dy: 1, dx: 0 },
          '<': { dy: 0, dx: -1 }
        };
        const dirs = Object.keys(guard);
        let guardpos = { y: -1, x: -1 };
        let guardchar = 'x';
        let guardrotation = -1;
        const input = data.trim().split('\n').map((r, y) => {
          const row = r.split('');
          const found = row.findIndex(c => dirs.includes(c));
          if (found >= 0) {
            guardpos = { y, x: found };
            guardchar = row[found];
            guardrotation = dirs.indexOf(guardchar);
          }
          return row;
        });
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;

        console.log(dirs, guardpos, guardchar, guardrotation, ymax, xmax, input);
        let safety = 10000;
        let steps = 0;
        while (safety--) {
          input[guardpos.y][guardpos.x] = 'X';
          let change = guard[guardchar];
          let nextpos = { y: guardpos.y + change.dy, x: guardpos.x + change.dx };
          let safety2 = 5;
          if (!inRange(nextpos)) {
            break;
          }
          while (input[nextpos.y][nextpos.x] === '#' && safety2--) {
            // rotate right
            guardrotation = (guardrotation + 1) % 4;
            guardchar = dirs[guardrotation];
            change = guard[guardchar];
            nextpos = { y: guardpos.y + change.dy, x: guardpos.x + change.dx };
            if (!inRange(nextpos)) {
              break;
            }
          }
          guardpos = nextpos;
          steps++;
        }
        const grid = input.map(r => r.join('')).join('\n');
        const count = grid.match(/X/g).length;
        console.log(safety, steps, '\n' + grid, count);
        return count;
      },
      part2: (data) => {
        const guard = {
          '^': { dy: -1, dx: 0 },
          '>': { dy: 0, dx: 1 },
          v: { dy: 1, dx: 0 },
          '<': { dy: 0, dx: -1 }
        };
        const dirs = Object.keys(guard);
        let guardpos = { y: -1, x: -1 };
        let guardchar = 'x';
        let guardrotation = -1;
        const input = data.trim().split('\n').map((r, y) => {
          const row = r.split('');
          const found = row.findIndex(c => dirs.includes(c));
          if (found >= 0) {
            guardpos = { y, x: found };
            guardchar = row[found];
            guardrotation = dirs.indexOf(guardchar);
          }
          return row;
        });
        const ymax = input.length;
        const xmax = input[0].length;
        const inRange = p => p.y >= 0 && p.y < ymax && p.x >= 0 && p.x < xmax;

        console.log(dirs, guardpos, guardchar, guardrotation, ymax, xmax, input);
        let safety = 10000;
        let steps = 0;
        const route = [];
        let count = 0;
        const blocks = [];
        while (safety--) {
          // console.log(guardpos.y, guardpos.x, guardchar);
          input[guardpos.y][guardpos.x] = guardchar;
          let change = guard[guardchar];
          let nextpos = { y: guardpos.y + change.dy, x: guardpos.x + change.dx };
          let safety2 = 5;
          if (!inRange(nextpos)) {
            break;
          }
          while (input[nextpos.y][nextpos.x] === '#' && safety2--) {
            // rotate right
            guardrotation = (guardrotation + 1) % 4;
            guardchar = dirs[guardrotation];
            change = guard[guardchar];
            nextpos = { y: guardpos.y + change.dy, x: guardpos.x + change.dx };
            if (!inRange(nextpos)) {
              break;
            }
          }

          guardpos = nextpos;
          route.push({
            char: guardchar,
            rot: dirs.indexOf(guardchar),
            y: guardpos.y,
            x: guardpos.x
          });

          // look right for repeating
          const lookloop = [];
          let lookrrotate = (guardrotation + 1) % 4;
          let lookrchar = dirs[lookrrotate];
          let lookrchange = guard[lookrchar];
          let lookrpos = { y: guardpos.y, x: guardpos.x };
          let lookrnextpos = { y: lookrpos.y + lookrchange.dy, x: lookrpos.x + lookrchange.dx };
          let safety4 = 1000;
          while (inRange(lookrnextpos) && inRange(lookrpos) && safety4-- > 0) {
            let safety3 = 4;
            while (input[lookrnextpos.y][lookrnextpos.x] === '#' && safety3-- > 0) {
              lookrrotate = (lookrrotate + 1) % 4;
              lookrchar = dirs[lookrrotate];
              lookrchange = guard[lookrchar];
              lookrnextpos = { y: lookrpos.y + lookrchange.dy, x: lookrpos.x + lookrchange.dx };
              console.log(safety3, lookrchar, lookrrotate, lookrnextpos.y, lookrnextpos.x);
              if (!inRange(lookrnextpos)) {
                break;
              }
            }
            if (safety3 <= 0) {
              console.log('safety3');
            }
            lookrpos = lookrnextpos;
            if (route.some(p => p.y === lookrpos.y && p.x === lookrpos.x && p.char === lookrchar) || lookloop.some(p => p.y === lookrpos.y && p.x === lookrpos.x && p.char === lookrchar)) {
              const dd = guard[guardchar];
              const o = { y: guardpos.y + dd.dy, x: guardpos.x + dd.dx };
              count++;
              blocks.push(o);
              break;
            }
            lookloop.push(lookrpos);
            // continue bouncing off of obstacles and looking for loop
          }
          if (safety4 <= 0) {
            console.log('safety4', { y: guardpos.y, x: guardpos.x });
          }
          steps++;
        }
        console.log(route);

        /*
        const rlen = route.length;
        for (let i = 1; i < rlen; i++) {
          const point = route[i];
          // look right for repeating
          let lookrrotate = (point.rot + 1) % 4;
          let lookrchar = dirs[lookrrotate];
          let lookrchange = guard[lookrchar];
          let lookrpos = { y: point.y + lookrchange.dy, x: point.x + lookrchange.dx };
          if (inRange(lookrpos)) {
            const dd = guard[point.char];
            const o = { y: point.y + dd.dy, x: point.x + dd.dx };
            if (inRange(o) && input[o.y][o.x] !== '#') {
              let safety5 = 10000;
              while (safety5-- && inRange(lookrpos)) {
                // if (input[lookrpos.y][lookrpos.x] === lookrchar) {
                if (route.some(p => p.y === lookrpos.y && p.x === lookrpos.x && p.char === lookrchar)) {
                  input[o.y][o.x] = 'O';
                  count++;
                  break;
                }
                // continue bouncing off of obstacles and looking for loop?
                let safety6 = 5;
                while (input[lookrpos.y][lookrpos.x] === '#' && safety6--) {
                  lookrrotate = (lookrrotate + 1) % 4;
                  lookrchar = dirs[lookrrotate];
                  lookrchange = guard[lookrchar];
                }
                lookrpos = { y: lookrpos.y + lookrchange.dy, x: lookrpos.x + lookrchange.dx };
              }
            }
          }
        }
        */

        blocks.forEach(p => { input[p.y][p.x] = 'O'; });
        const grid = input.map(r => r.join('')).join('\n');
        console.log(safety, steps, '\n' + grid, count);
        // 508 too low
        // 1631 too low
        // 1632 too low
        return count;
      }
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
