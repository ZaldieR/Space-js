const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const score_text = document.querySelector('#score_text');
const start_game = document.querySelector('#start_game');
const panel = document.querySelector('#panel');
const score_end = document.querySelector('#score_end');

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];

let score = 0;
let animationId;

const overSound = new Audio("gameover.wav");
const shotSound = new Audio("shot.wav");

function init() {
    player = new Player(x, y, 10, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    score_text.innerHTML = score;
    score_end.innerHTML = score;
}

function animate()
{
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0);
        } else {
            particle.update();
        }
    });
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }

    });
    enemies.forEach((enemy, indexe) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        // game over
        if (dist - enemy.radius - player.radius < 1) {
            overSound.play();
            cancelAnimationFrame(animationId);
            panel.style.display = 'flex';
            score_end.innerHTML = score;
        }
        projectiles.forEach((projectile, indexp) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            // projectile hit enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                // create explosion
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2,
                    enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 5),
                        y: (Math.random() - 0.5) * (Math.random() * 5)}))
                }
                if (enemy.radius - 10 > 10) {
                    score += 100;
                    score_text.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(indexp, 1);
                    }, 0);
                } else {
                    score += 250;
                    score_text.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(indexe, 1);
                        projectiles.splice(indexp, 1);
                    }, 0);
                }
            }
        });
    });
}

window.addEventListener("click", (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4,
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white',
    velocity));
});

start_game.addEventListener("click", (event) => {
    init();
    panel.style.display = 'none';
    animate();
    spawnEnemies();
});
