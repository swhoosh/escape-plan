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
  let board = createArray(grid_size)
  board = generateObstacle(board)
  board = generateTiles(board, 2) // generate tunnel
  return board
}

const generateObstacle = (board) => {
  let n = 0
  while (n < max_obstacle) {
    let x = getRandomInt(grid_size - 1)
    let y = getRandomInt(grid_size - 1)
    if (board[y][x] !== 1) {
      board[y][x] = 1
      n++
    }
  }
  return board
}

const generateTiles = (board, tiles_type) => {
  while (true) {
    let x = getRandomInt(grid_size - 1)
    let y = getRandomInt(grid_size - 1)
    if (board[y][x] === 0) {
      board[y][x] = tiles_type
      return board
    }
  }
}

export const generateEntityPos = (board) => {
  while (true) {
    let x = getRandomInt(grid_size - 1)
    let y = getRandomInt(grid_size - 1)
    if (board[y][x] === 0) {
      return { x: x, y: y }
    }
  }
}

export const createArray = (size) => {
  let arr = new Array(size)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(size).fill(0)
  }
  return arr
}

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * (max + 1))
}

export const checkWin = (role, x, y, board) => {
  if (role === 'warder' && board[y][x] === 4) return true
  if (role === 'prisoner' && board[y][x] === 2) return true
  return false
}

// var board = generateBoard()
// board.forEach((row) => console.log(row))

// for (let i = 0; i < 10; i++) {
//   console.log(getRandomInt(1))
// }

// export default { generateBoard, createArray }
