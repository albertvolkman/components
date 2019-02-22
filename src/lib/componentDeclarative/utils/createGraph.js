const { DepGraph } = require('dependency-graph')
const { reduce } = require('../../../utils')
const { types } = require('./variables')

function createGraph(prepareComponents, variableObjects) {
  let dag = new DepGraph()

  // reduce over all the variables and add the corresponding
  // instances and their dependencies to the graph
  dag = reduce(
    (accum, object) => {
      const { instanceId, type } = object
      // only add component types to the dag
      if (type === types.component) {
        const dependencyId = object.value.split('.')[0]
        accum.addNode(instanceId)
        accum.addNode(dependencyId)
        accum.addDependency(instanceId, dependencyId)
      }
      return accum
    },
    dag,
    variableObjects
  )

  // reduce over all the components we've prepared based on
  // the serverless file and add all instances to the graph
  dag = reduce(
    (accum, instanceId) => {
      accum.addNode(instanceId)
      return accum
    },
    dag,
    Object.keys(prepareComponents)
  )

  // TODO: explicitly check for circular dependencies here
  // this is commented out since re-throwing the error won't cause
  // the CLI to pick it up and print the error message in red
  // // check for circular dependencies
  // try {
  //   dag.overallOrder()
  // } catch (error) {
  //   throw new Error(error.message)
  // }

  return dag
}

module.exports = createGraph
