const {weights, names} = require('./data/1802gh')

const weightsFor = exports.weightsFor =
  i => weights.map(row => row[i])

const indexOf = exports.indexOf = Object.assign(
  ...names.map(
    (name, index) => ({ [name]: index })
  )
)

const sumFrom = (sum, val) => sum + val
const sum = vals => vals.reduce(sumFrom, 0)

const totals = exports.totals = names
  .map((_, i) => sum(weightsFor(i)))

const shuffle = require('shuffle-array')

const myHappinessInGroup = (me, [...group]) =>
  sum(group.map(other => weights[me][other]))

const happiness = group =>
  sum(group.map(me => myHappinessInGroup(me, group)))

function iter(n) {
  // const byWeightDesc = shuffle([...names])
  //   .map(name => indexOf[name])
  //   .sort((x, y) => totals[y] - totals[x])  
  const groups = new Array(n).fill('x').map(_ => [])
  const maxGroupSize = Math.ceil(names.length / n)
  // const unassigned = [...byWeightDesc]
  const unassigned = shuffle(names.map((_, i) => i))
  while (unassigned.length) {
    const s = unassigned.pop()
    const possibleGroups = groups.map(
      (group, i) => {
        const newGroup = [...group, s]
        const delta = newGroup.length < maxGroupSize
          ? happiness(newGroup) - happiness(group)
          : -1
        return {newGroup, delta, i}
      }
    ).sort((a, b) =>
      b.delta - a.delta
    )

    groups[possibleGroups[0].i].push(s)
    shuffle(groups)

  }
  
  const report = groups.map(group => Object.assign({
    TOTAL: happiness(group)
  }, ...group.map(me => ({
    [names[me]]: myHappinessInGroup(me, group)
  }))))

  return {
    groups: report,
    total: sum(report.map(_ => _.TOTAL))
  }
}

const goGoGadgetSortingHat = (n, {iterations=1e6, onNewBest=()=>{}}={}) => {
  let best = null
  while (iterations --> 0) {
    const trial = iter(n)
    if (!best || trial.total > best.total) {
      onNewBest(trial, best)
      best = trial      
    }
  }
  return best
}


const clear = require('clear')

const allGroups = goGoGadgetSortingHat(6, {
  onNewBest(best) {
    clear()
    console.log('*****')
    console.log(best)
  }
})