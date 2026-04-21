/**
 * ROUTING TASK
 * Grid-based delivery route planning with obstacles (matching main study)
 */

class RoutingTask {
    constructor(canvasId, onTaskComplete) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.onTaskComplete = onTaskComplete;
        
        this.cellSize = 35; // Size of each grid cell in pixels
        this.gridSize = 10; // 10x10 grid
        
        this.pathfinder = new Pathfinder(this.gridSize);
        
        this.selectedRoute = [];
        
        this.generateNewTask();
        this.setupControls();
    }

    generateNewTask() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            const obstacles = this.generateRandomObstacles();
            const locations = this.generateRandomLocations(obstacles);
            
            // Set up pathfinder with obstacles
            this.pathfinder.setObstacles(obstacles);
            
            // Validate that all locations are reachable from each other
            const startLocation = locations[0];
            const allReachable = locations.every(loc => {
                if (loc.id === startLocation.id) return true;
                
                const distance = this.pathfinder.calculateDistance(
                    {x: startLocation.x, y: startLocation.y},
                    {x: loc.x, y: loc.y}
                );
                
                return distance !== Infinity;
            });
            
            // Check all pairs are reachable
            let allPairsReachable = true;
            for (let i = 0; i < locations.length && allPairsReachable; i++) {
                for (let j = i + 1; j < locations.length; j++) {
                    const distance = this.pathfinder.calculateDistance(
                        {x: locations[i].x, y: locations[i].y},
                        {x: locations[j].x, y: locations[j].y}
                    );
                    
                    if (distance === Infinity) {
                        allPairsReachable = false;
                        break;
                    }
                }
            }
            
            if (allReachable && allPairsReachable) {
                this.currentTask = {
                    obstacles: obstacles,
                    locations: locations,
                    startLocation: startLocation,
                    deliveryLocations: locations.slice(1)
                };
                
                this.selectedRoute = ['START'];
                this.draw();
                this.renderDropdowns();
                return;
            }
        }
        
        // Fallback - simple map with no obstacles
        console.warn('Could not generate valid map, creating simple map');
        this.generateSimpleTask();
    }

    generateSimpleTask() {
        const locations = this.generateRandomLocations([]);
        this.pathfinder.setObstacles([]);
        
        this.currentTask = {
            obstacles: [],
            locations: locations,
            startLocation: locations[0],
            deliveryLocations: locations.slice(1)
        };
        
        this.selectedRoute = ['START'];
        this.draw();
        this.renderDropdowns();
    }

    generateRandomObstacles() {
        const obstacles = [];
        const numObstacles = Math.floor(Math.random() * 11) + 10; // 10-20 obstacles
        
        const occupied = new Set();
        
        for (let i = 0; i < numObstacles; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.gridSize);
                y = Math.floor(Math.random() * this.gridSize);
            } while (occupied.has(`${x},${y}`));
            
            occupied.add(`${x},${y}`);
            obstacles.push([x, y]);
        }
        
        return obstacles;
    }

    generateRandomLocations(obstacles) {
        const locations = [];
        const occupied = new Set(obstacles.map(([x, y]) => `${x},${y}`));
        
        // Location names: 1 origin + 5 delivery stops
        const names = ['Origin', 'Stop A', 'Stop B', 'Stop C', 'Stop D', 'Stop E'];
        const ids = ['START', 'A', 'B', 'C', 'D', 'E'];
        
        for (let i = 0; i < 6; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.gridSize);
                y = Math.floor(Math.random() * this.gridSize);
            } while (occupied.has(`${x},${y}`));
            
            occupied.add(`${x},${y}`);
            
            locations.push({
                id: ids[i],
                name: names[i],
                x: x,
                y: y,
                isStart: i === 0
            });
        }
        
        return locations;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw obstacles
        this.ctx.fillStyle = '#e74c3c';
        this.currentTask.obstacles.forEach(([x, y]) => {
            this.ctx.fillRect(
                x * this.cellSize + 2,
                y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
        });
        
        // Draw delivery locations
        this.currentTask.deliveryLocations.forEach(loc => {
            this.ctx.fillStyle = '#3498db';
            this.ctx.beginPath();
            this.ctx.arc(
                loc.x * this.cellSize + this.cellSize / 2,
                loc.y * this.cellSize + this.cellSize / 2,
                this.cellSize / 3,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                loc.id,
                loc.x * this.cellSize + this.cellSize / 2,
                loc.y * this.cellSize + this.cellSize / 2
            );
        });
        
        // Draw start location
        const start = this.currentTask.startLocation;
        this.ctx.fillStyle = '#27ae60';
        this.ctx.beginPath();
        this.ctx.arc(
            start.x * this.cellSize + this.cellSize / 2,
            start.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2.5,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(
            'S',
            start.x * this.cellSize + this.cellSize / 2,
            start.y * this.cellSize + this.cellSize / 2
        );
        
        // Draw selected route with pathfinding
        this.drawRoutePaths();
    }

    drawRoutePaths() {
        if (this.selectedRoute.length < 2) return;
        
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 3;
        
        for (let i = 0; i < this.selectedRoute.length - 1; i++) {
            const fromLoc = this.currentTask.locations.find(loc => loc.id === this.selectedRoute[i]);
            const toLoc = this.currentTask.locations.find(loc => loc.id === this.selectedRoute[i + 1]);
            
            if (fromLoc && toLoc) {
                const path = this.getPath(
                    {x: fromLoc.x, y: fromLoc.y},
                    {x: toLoc.x, y: toLoc.y}
                );
                
                if (path && path.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        path[0].x * this.cellSize + this.cellSize / 2,
                        path[0].y * this.cellSize + this.cellSize / 2
                    );
                    
                    for (let j = 1; j < path.length; j++) {
                        this.ctx.lineTo(
                            path[j].x * this.cellSize + this.cellSize / 2,
                            path[j].y * this.cellSize + this.cellSize / 2
                        );
                    }
                    
                    this.ctx.stroke();
                }
            }
        }
    }

    getPath(start, end) {
        if (start.x === end.x && start.y === end.y) {
            return [start];
        }

        const queue = [[start.x, start.y, []]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (queue.length > 0) {
            const [x, y, path] = queue.shift();
            const currentPath = [...path, {x, y}];

            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                if (newX === end.x && newY === end.y) {
                    return [...currentPath, {x: newX, y: newY}];
                }

                const key = `${newX},${newY}`;

                if (this.pathfinder.isValid(newX, newY) && !visited.has(key)) {
                    visited.add(key);
                    queue.push([newX, newY, currentPath]);
                }
            }
        }

        return null;
    }

renderDropdowns() {
        const container = document.getElementById('route-dropdowns');
        container.innerHTML = '';
        
        const stops = ['1st', '2nd', '3rd', '4th', '5th'];
        
        stops.forEach((stop, index) => {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'route-stop';
            
            const label = document.createElement('label');
            label.textContent = `${stop} Stop:`;
            
            const select = document.createElement('select');
            select.className = 'route-dropdown';
            select.id = `stop-${index}`;
            select.disabled = index !== 0;
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Select --';
            select.appendChild(defaultOption);
            
            this.currentTask.deliveryLocations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.id;
                option.textContent = loc.name;
                select.appendChild(option);
            });
            
            select.addEventListener('change', () => this.handleDropdownChange(index));
            
            stopDiv.appendChild(label);
            stopDiv.appendChild(select);
            container.appendChild(stopDiv);
        });
    }

    handleDropdownChange(stopIndex) {
        const dropdowns = Array.from(document.querySelectorAll('.route-dropdown'));
        const currentDropdown = dropdowns[stopIndex];
        
        // Re-enable previously selected value
        const previousValue = currentDropdown.dataset.previousValue;
        if (previousValue) {
            dropdowns.forEach((dd, i) => {
                if (i !== stopIndex) {
                    const option = dd.querySelector(`option[value="${previousValue}"]`);
                    if (option) option.disabled = false;
                }
            });
        }
        
        // Get new selected location
        const selectedId = currentDropdown.value;
        currentDropdown.dataset.previousValue = selectedId;
        
        if (selectedId) {
            // Disable this option in other dropdowns
            dropdowns.forEach((dd, i) => {
                if (i !== stopIndex) {
                    const option = dd.querySelector(`option[value="${selectedId}"]`);
                    if (option) option.disabled = true;
                }
            });
            
            // Enable next dropdown
            if (stopIndex < dropdowns.length - 1) {
                dropdowns[stopIndex + 1].disabled = false;
            }
        } else {
            // If cleared, disable subsequent dropdowns
            for (let i = stopIndex + 1; i < dropdowns.length; i++) {
                dropdowns[i].disabled = true;
                dropdowns[i].value = '';
                const prevVal = dropdowns[i].dataset.previousValue;
                if (prevVal) {
                    dropdowns.forEach((dd, j) => {
                        if (j !== i) {
                            const option = dd.querySelector(`option[value="${prevVal}"]`);
                            if (option) option.disabled = false;
                        }
                    });
                }
                dropdowns[i].dataset.previousValue = '';
            }
        }
        
        // Update route
        this.updateRoute();
    }

updateRoute() {
    const dropdowns = Array.from(document.querySelectorAll('.route-dropdown'));
    const selectedIds = dropdowns.map(dd => dd.value).filter(v => v !== '');
    
    this.selectedRoute = ['START', ...selectedIds];
    
    // Add return to origin if all stops selected
    if (selectedIds.length === 5) {
        this.selectedRoute.push('START');
    }
    
    this.draw();
    this.updateDistanceDisplay();
    
    // Enable/disable submit button and show reminder
    const submitBtn = document.getElementById('submit-route');
    
    if (submitBtn) {
        submitBtn.disabled = selectedIds.length !== 5;
        
        // Add or update reminder message
        let reminderMsg = document.getElementById('route-reminder');
        
        if (selectedIds.length < 5) {
            if (!reminderMsg) {
                reminderMsg = document.createElement('div');
                reminderMsg.id = 'route-reminder';
                reminderMsg.style.cssText = 'color: #e74c3c; font-weight: 600; margin-top: 10px; font-size: 14px;';
                submitBtn.parentNode.insertBefore(reminderMsg, submitBtn);
            }
            reminderMsg.textContent = `Please select all 5 stops (${5 - selectedIds.length} remaining)`;
            reminderMsg.style.display = 'block';
        } else {
            if (reminderMsg) {
                reminderMsg.style.display = 'none';
            }
        }
    }
}

    updateDistanceDisplay() {
        const distanceEl = document.getElementById('route-distance');
        
        if (this.selectedRoute.length === 7) { // START + 5 stops + START
            const distance = this.pathfinder.calculateRouteDistance(
                this.currentTask.locations,
                this.selectedRoute
            );
            distanceEl.textContent = distance + ' units';
        } else {
            distanceEl.textContent = '-- units';
        }
    }

    calculateOptimalRoute() {
        // Get all delivery locations (excluding start)
        const deliveryIds = this.currentTask.deliveryLocations.map(loc => loc.id);
        
        // Generate all permutations
        const permutations = this.generatePermutations(deliveryIds);
        
        let minDistance = Infinity;
        
        // Try each permutation
        permutations.forEach(perm => {
            const route = ['START', ...perm, 'START'];
            
            const distance = this.pathfinder.calculateRouteDistance(
                this.currentTask.locations,
                route
            );
            
            if (distance < minDistance) {
                minDistance = distance;
            }
        });
        
        return minDistance;
    }

    generatePermutations(arr) {
        if (arr.length <= 1) return [arr];
        
        const permutations = [];
        
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const remainingPerms = this.generatePermutations(remaining);
            
            remainingPerms.forEach(perm => {
                permutations.push([current, ...perm]);
            });
        }
        
        return permutations;
    }

    setupControls() {
        const submitBtn = document.getElementById('submit-route');
        
        submitBtn.addEventListener('click', () => {
            const dropdowns = Array.from(document.querySelectorAll('.route-dropdown'));
            const selectedIds = dropdowns.map(dd => dd.value).filter(v => v !== '');
            
            if (selectedIds.length !== 5) {
                alert('Please select all 5 stops before submitting.');
                return;
            }
            
            const uniqueStops = new Set(selectedIds);
            if (uniqueStops.size !== 5) {
                alert('Please select each stop only once.');
                return;
            }
            
            // Build full route
            const fullRoute = ['START', ...selectedIds, 'START'];
            
            const selectedDistance = this.pathfinder.calculateRouteDistance(
                this.currentTask.locations,
                fullRoute
            );
            
            const optimalDistance = this.calculateOptimalRoute();
            const efficiency = (optimalDistance / selectedDistance) * 100;
            
            if (this.onTaskComplete) {
                this.onTaskComplete(efficiency);
            }
            
            let feedback = '';
            if (efficiency >= 100) {
                feedback = '🎉 Perfect! You found the optimal route!';
            } else if (efficiency >= 95) {
                feedback = '✨ Excellent! Very close to optimal!';
            } else if (efficiency >= 85) {
                feedback = '👍 Good job! Pretty efficient route.';
            } else if (efficiency >= 75) {
                feedback = '📝 Not bad. Try to find shorter routes!';
            } else {
                feedback = '💡 There\'s room for improvement. Keep trying!';
            }
            
            alert(
                `${feedback}\n\n` +
                `Your route: ${selectedDistance} units\n` +
                `Optimal route: ${optimalDistance} units\n` +
                `Efficiency: ${efficiency.toFixed(1)}%`
            );
            
            // Generate new task
            this.generateNewTask();
        });
    }
}