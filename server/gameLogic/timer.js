export const gameTimer = (
  io,
  room_id,
  timer_interval,
  skipturn,
  options,
) => {
  //default 10 + 1 second turn timer. give +1 second
  //clear interval of prev turn
  let turn_time = options.speedMode ? 3 : 10
  if (typeof timer_interval !== 'undefined') clearInterval(timer_interval)
  //start interval
  io.to(room_id).emit('timer', turn_time)
  turn_time--
  timer_interval = setInterval(() => {
    if (turn_time >= 0) {
      io.to(room_id).emit('timer', turn_time)
      turn_time--
    } else {
      clearInterval(timer_interval)
      //todo skip turn
      skipturn(room_id)
    }
  }, 1000)
  return timer_interval
}
