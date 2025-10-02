    // ===== MÖBIUS STRIP BACKGROUND =====
const bgCanvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: bgCanvas,
    alpha: true, 
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 30;

function mobiusStrip(u, v, target) {
    u = u * Math.PI * 2;
    v = v * 2 - 1;
    
    const R = 20;
    const w = 1;
    
    v = v * w;
    
    const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
    const y = (R + v * Math.cos(u / 2)) * Math.sin(u);
    const z = v * Math.sin(u / 2);
    
    target.set(x, y, z);
}

const geometry = new THREE.ParametricGeometry(mobiusStrip, 500, 20);

// Wireframe mesh (pink)
const material = new THREE.MeshBasicMaterial({ 
    color: 0xff006e,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
});
const mobius = new THREE.Mesh(geometry, material);

// Solid black edges
const edges = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff006e,
    linewidth: 5
});
const edgeLines = new THREE.LineSegments(edges, edgeMaterial);

// Group them together
const mobiusGroup = new THREE.Group();
mobiusGroup.add(mobius);
mobiusGroup.add(edgeLines);
scene.add(mobiusGroup);

mobiusGroup.position.x = 5;
mobiusGroup.position.y = -2;

mobiusGroup.rotation.x = Math.random() * Math.PI * 2;
mobiusGroup.rotation.y = Math.random() * Math.PI * 2;
mobiusGroup.rotation.z = Math.random() * Math.PI * 2;

function animateMobius() {
    requestAnimationFrame(animateMobius);
    mobiusGroup.rotation.x += 0.0003;
    mobiusGroup.rotation.y += 0.0005;
    mobiusGroup.rotation.z += 0.0002;
    renderer.render(scene, camera);
}
animateMobius();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

    class GraphSparks {
        constructor(containerSelector) {
            this.container = document.querySelector(containerSelector);
            this.canvas = document.getElementById('graph-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
            
            this.nodes = Array.from(this.container.querySelectorAll('.cta-button'));
            this.nodePositions = [];
            this.edges = [];
            this.sparks = [];
            this.buttonBounds = [];
            
            this.init();
        }
        
        init() {
            this.positionNodesRandomly();
            
            setTimeout(() => {
                this.calculateNodePositions();
                this.createEdgesWithCollisionCheck();
                this.animate();
                this.spawnSparks();
            }, 100);
            
            window.addEventListener('resize', () => this.handleResize());
        }
        
        positionNodesRandomly() {
            const containerWidth = this.container.offsetWidth;
            const containerHeight = this.container.offsetHeight;
            const padding = 30;
            const minDistance = 120;
            
            this.nodes.forEach((node, index) => {
                let placed = false;
                let attempts = 0;
                const maxAttempts = 100;
                
                while (!placed && attempts < maxAttempts) {
                    const x = padding + Math.random() * (containerWidth - 2 * padding - node.offsetWidth);
                    const y = padding + Math.random() * (containerHeight - 2 * padding - node.offsetHeight);
                    
                    const centerX = x + node.offsetWidth / 2;
                    const centerY = y + node.offsetHeight / 2;
                    
                    let overlaps = false;
                    for (let i = 0; i < index; i++) {
                        const otherNode = this.nodes[i];
                        const otherRect = otherNode.getBoundingClientRect();
                        const containerRect = this.container.getBoundingClientRect();
                        
                        const otherCenterX = otherRect.left - containerRect.left + otherRect.width / 2;
                        const otherCenterY = otherRect.top - containerRect.top + otherRect.height / 2;
                        
                        const distance = Math.sqrt(
                            Math.pow(centerX - otherCenterX, 2) + 
                            Math.pow(centerY - otherCenterY, 2)
                        );
                        
                        if (distance < minDistance) {
                            overlaps = true;
                            break;
                        }
                    }
                    
                    if (!overlaps) {
                        node.style.left = x + 'px';
                        node.style.top = y + 'px';
                        placed = true;
                    }
                    
                    attempts++;
                }
                
                if (!placed) {
                    const fallbackX = (index + 1) * containerWidth / (this.nodes.length + 1);
                    const fallbackY = containerHeight / 2;
                    node.style.left = (fallbackX - node.offsetWidth / 2) + 'px';
                    node.style.top = (fallbackY - node.offsetHeight / 2) + 'px';
                }
            });
        }
        
        calculateNodePositions() {
            this.nodePositions = [];
            this.buttonBounds = [];
            
            this.nodes.forEach(node => {
                const rect = node.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                
                const x = rect.left - containerRect.left + rect.width / 2;
                const y = rect.top - containerRect.top + rect.height / 2;
                
                this.nodePositions.push({ x, y, element: node });
                
                this.buttonBounds.push({
                    left: rect.left - containerRect.left,
                    top: rect.top - containerRect.top,
                    right: rect.left - containerRect.left + rect.width,
                    bottom: rect.top - containerRect.top + rect.height,
                    width: rect.width,
                    height: rect.height
                });
            });
        }
        
        createEdgesWithCollisionCheck() {
            this.edges = [];
            
            for (let i = 0; i < this.nodePositions.length; i++) {
                for (let j = i + 1; j < this.nodePositions.length; j++) {
                    const fromPos = this.nodePositions[i];
                    const toPos = this.nodePositions[j];
                    
                    let intersectsButton = false;
                    
                    for (let k = 0; k < this.buttonBounds.length; k++) {
                        if (k === i || k === j) continue;
                        
                        if (this.lineIntersectsRect(
                            fromPos.x, fromPos.y,
                            toPos.x, toPos.y,
                            this.buttonBounds[k]
                        )) {
                            intersectsButton = true;
                            break;
                        }
                    }
                    
                    if (!intersectsButton) {
                        this.edges.push({
                            from: i,
                            to: j,
                            fromPos: fromPos,
                            toPos: toPos
                        });
                    }
                }
            }
        }
        
        lineIntersectsRect(x1, y1, x2, y2, rect) {
            if (this.pointInRect(x1, y1, rect) || this.pointInRect(x2, y2, rect)) {
                return true;
            }
            
            const edges = [
                { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.top },
                { x1: rect.right, y1: rect.top, x2: rect.right, y2: rect.bottom },
                { x1: rect.left, y1: rect.bottom, x2: rect.right, y2: rect.bottom },
                { x1: rect.left, y1: rect.top, x2: rect.left, y2: rect.bottom }
            ];
            
            for (const edge of edges) {
                if (this.lineSegmentsIntersect(x1, y1, x2, y2, edge.x1, edge.y1, edge.x2, edge.y2)) {
                    return true;
                }
            }
            
            return false;
        }
        
        pointInRect(x, y, rect) {
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }
        
        lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
            const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            
            if (Math.abs(denom) < 0.0001) {
                return false;
            }
            
            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
            const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
            
            return t >= 0 && t <= 1 && u >= 0 && u <= 1;
        }
        
        spawnSparks() {
            const spawnSpark = () => {
                if (this.edges.length === 0) {
                    setTimeout(spawnSpark, 1000);
                    return;
                }
                
                const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
                const reversed = Math.random() < 0.5;
                const start = reversed ? edge.toPos : edge.fromPos;
                const end = reversed ? edge.fromPos : edge.toPos;
                
                this.sparks.push({
                    startX: start.x,
                    startY: start.y,
                    endX: end.x,
                    endY: end.y,
                    progress: 0,
                    speed: 0.005 + Math.random() * 0.002,
                    color: Math.random() < 0.5 ? '#ff006e' : '#00f0ff',
                    size: 2 + Math.random() * 2
                });
                
                const nextDelay = 500 + Math.random() * 1500;
                setTimeout(spawnSpark, nextDelay);
            };
            
            spawnSpark();
        }
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // BREATHING EDGES - slow pulse effect
            const breathe = 0.1 + Math.sin(Date.now() / 2000) * 0.08; // Oscillates between 0.02-0.18
            
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${breathe})`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
                
            this.edges.forEach(edge => {
                this.ctx.beginPath();
                this.ctx.moveTo(edge.fromPos.x, edge.fromPos.y);
                this.ctx.lineTo(edge.toPos.x, edge.toPos.y);
                this.ctx.stroke();
            });
                
            this.ctx.setLineDash([]);
            
            this.ctx.shadowBlur = 0; // Reset shadow
                
            // Draw sparks
            this.sparks = this.sparks.filter(spark => {
                spark.progress += spark.speed;
                
                if (spark.progress >= 1) {
                    return false;
                }
                
                const x = spark.startX + (spark.endX - spark.startX) * spark.progress;
                const y = spark.startY + (spark.endY - spark.startY) * spark.progress;
                
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = spark.color;
                this.ctx.fillStyle = spark.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, spark.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                const trailLength = 0.1;
                const trailStart = Math.max(0, spark.progress - trailLength);
                const trailX = spark.startX + (spark.endX - spark.startX) * trailStart;
                const trailY = spark.startY + (spark.endY - spark.startY) * trailStart;
                
                this.ctx.shadowBlur = 5;
                this.ctx.strokeStyle = spark.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(trailX, trailY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
                
                return true;
            });
            
            this.ctx.shadowBlur = 0; // Reset shadow for next frame
            
            requestAnimationFrame(() => this.animate());
        }
        
        handleResize() {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
            
            this.positionNodesRandomly();
            
            setTimeout(() => {
                this.calculateNodePositions();
                this.createEdgesWithCollisionCheck();
            }, 100);
        }
    }

    window.addEventListener('load', () => {
        new GraphSparks('.buttons-container');
    });