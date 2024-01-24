const canvas = document.querySelector('canvas')
const canvasContext = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

canvasContext.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png',
  scale: 2.2
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/playerTwo/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: -115,
    y: 70
  },
  sprites: {
    idle: {
      imageSrc: './img/playerTwo/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/playerTwo/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/playerTwo/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/playerTwo/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/playerTwo/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/playerTwo/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/playerTwo/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/playerOne/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 15,
    y: 80
  },
  sprites: {
    idle: {
      imageSrc: './img/playerOne/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/playerOne/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/playerOne/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/playerOne/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/playerOne/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/playerOne/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/playerOne/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  canvasContext.fillStyle = 'black'
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  canvasContext.fillStyle = 'rgba(255, 255, 255, 0.15)'
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case 's':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
