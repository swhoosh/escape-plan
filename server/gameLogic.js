const grid_size = 5
const max_obstacle = Math.floor(0.2 * grid_size * grid_size)

/* tile info
    0 : normal 
    1 : obstacle 
    2 : tunnel
    3 : warder
    4 : prisoner
*/
export const generateBoard = () => {
  var board = createArray(grid_size)

  return board
}

export const createArray = (size) => {
  var arr = new Array(size)

  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(size).fill(0)
  }

  return arr
}

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * (max + 1))
}

// var board = generateBoard()
// board.forEach((row) => console.log(row))

// for (let i = 0; i < 10; i++) {
//   console.log(getRandomInt(1))
// }

// export default { generateBoard, createArray }
