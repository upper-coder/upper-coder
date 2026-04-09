/**
 * TASK SYSTEM
 * Manages routing optimization tasks with randomly generated maps
 * STATUS: IMPLEMENTED
 */

class TaskSystem {
constructor(experiment) {
    this.experiment = experiment;
    this.currentTask = null;
    this.taskStartTime = null;
    this.completedTasks = [];
    this.pathfinder = new Pathfinder(10);
    this.practiceComplete = false;
    
    this.containerElement = null;
    this.workContainer = null;
    this.helpContainer = null;
    this.practiceContainer = null;  // ADD THIS
    this.gridSize = 10;
}

/**
     * Generate a random task with random obstacles and locations
     * Ensures all locations are reachable from each other
     */
    generateTask() {
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        
        while (attempts < maxAttempts) {
            attempts++;
            
            const obstacles = this.generateRandomObstacles();
            const locations = this.generateRandomLocations(obstacles);
            
            // Set up pathfinder with obstacles
            this.pathfinder.setObstacles(obstacles);
            
            // Validate that all locations are reachable from the start
            const startLocation = locations[0];
            const allReachable = locations.every(loc => {
                if (loc.id === startLocation.id) return true; // Start is reachable from itself
                
                const distance = this.pathfinder.calculateDistance(
                    {x: startLocation.x, y: startLocation.y},
                    {x: loc.x, y: loc.y}
                );
                
                return distance !== Infinity;
            });
            
            // Also check that all locations can reach each other (not just from start)
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
                console.log(`✓ Valid task generated after ${attempts} attempt(s)`);
                
                return {
                    id: `task_${Date.now()}`,
                    gridSize: this.gridSize,
                    obstacles: obstacles,
                    locations: locations,
                    startLocation: startLocation,
                    deliveryLocations: locations.slice(1)
                };
            }
            
            // If not valid, loop will try again with new random generation
            console.log(`✗ Attempt ${attempts}: Invalid map (unreachable locations), regenerating...`);
        }
        
        // Fallback: if we can't generate a valid map after max attempts,
        // create a simple map with no obstacles
        console.warn('⚠️ Could not generate valid map with obstacles, creating simple map');
        return this.generateSimpleTask();
    }

    /**
     * Generate a simple task with no obstacles (fallback)
     */
    generateSimpleTask() {
        const locations = this.generateRandomLocations([]);
        
        this.pathfinder.setObstacles([]);
        
        return {
            id: `task_${Date.now()}`,
            gridSize: this.gridSize,
            obstacles: [],
            locations: locations,
            startLocation: locations[0],
            deliveryLocations: locations.slice(1)
        };
    }

    /**
     * Generate random obstacles (10-20% of grid cells)
     */
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

    /**
     * Generate random locations (1 start + 5 delivery stops)
     */
    generateRandomLocations(obstacles) {
        const locations = [];
        const occupied = new Set(obstacles.map(([x, y]) => `${x},${y}`));
        
        // Location names
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

    /**
     * Show task interface
     */
showTaskInterface(container, isPractice = false, isHelping = false) {
    console.log('=== showTaskInterface called ===');
    console.log('isPractice:', isPractice, 'isHelping:', isHelping);
    console.log('containerElement before:', this.containerElement);
    console.log('workContainer:', this.workContainer);
    console.log('Same container?', container === this.workContainer);
    
    if (isPractice && this.practiceComplete) {
        console.log('Practice already complete, skipping task generation');
        return;
    }
    
    // ... rest of method
    
this.containerElement = container;

// Track which container this is
if (isPractice) {
    this.practiceContainer = container;
} else if (isHelping) {
    this.helpContainer = container;
} else {
    this.workContainer = container;
}
    this.currentTask = this.generateTask();
    this.taskStartTime = Date.now();
    
    container.innerHTML = `
        <div class="routing-task">
            <div class="task-header">
                <h3>${isPractice ? 'Practice Task' : (isHelping ? 'Help Request - Delivery Route' : 'Delivery Route Optimization')}</h3>
            </div>
            
            <div class="task-instructions">
                <p>Plan the most efficient delivery route:</p>
                <ul>
                    <li>Start from <strong>${this.currentTask.startLocation.name}</strong></li>
                    <li>Visit all 5 delivery locations</li>
                    <li>Return to <strong>${this.currentTask.startLocation.name}</strong></li>
                </ul>
                <p><strong>Goal:</strong> Minimize total distance traveled.</p>
            </div>
            
            <div class="task-body">
                <div class="map-container">
<canvas id="routing-map-${isPractice ? 'practice' : (isHelping ? 'help' : 'work')}" width="350" height="350"></canvas>
                    <div class="map-legend">
                        <div><span class="legend-color" style="background: #27ae60;"></span> Origin (Start/End)</div>
                        <div><span class="legend-color" style="background: #3498db;"></span> Delivery Stops</div>
                        <div><span class="legend-color" style="background: #e74c3c;"></span> Obstacles</div>
                    </div>
                </div>
                
                <div class="route-controls">
                    <h4>Plan Your Route</h4>
                    <p class="route-info">Select delivery stops in order:</p>
                    
                    <div class="route-dropdowns">
                        ${this.renderRouteDropdowns()}
                    </div>
                    
                    <div class="route-summary">
                        <div class="route-path" id="route-path">
                            Route: ${this.currentTask.startLocation.name} → ...
                        </div>
                        <div class="route-estimate">
                            <strong>Estimated Total Distance:</strong> <span id="route-distance">--</span> units
                        </div>
                    </div>
                    
<button id="submit-route-btn-${isPractice ? 'practice' : (isHelping ? 'help' : 'work')}" class="task-submit-btn" disabled>
                        Submit Route
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Draw map AFTER a short delay to ensure canvas is in DOM
setTimeout(() => {
    const canvasId = `routing-map-${isPractice ? 'practice' : (isHelping ? 'help' : 'work')}`;
    this.drawMap(canvasId);
}, 200);
    
    this.attachDropdownListeners();
    
const submitBtn = document.getElementById(`submit-route-btn-${isPractice ? 'practice' : (isHelping ? 'help' : 'work')}`);
if (submitBtn) {
    submitBtn.addEventListener('click', () => this.submitRoute(isPractice, isHelping));
}
    
    console.log('Task displayed:', this.currentTask.id);
}
    /**
     * Render route selection dropdowns
     */
    renderRouteDropdowns() {
        const stops = ['1st', '2nd', '3rd', '4th', '5th'];
        let html = '';
        
        stops.forEach((stop, index) => {
            html += `
                <div class="route-stop">
                    <label>${stop} Stop:</label>
                    <select class="route-dropdown" data-stop="${index}" ${index === 0 ? '' : 'disabled'}>
                        <option value="">-- Select --</option>
                        ${this.currentTask.deliveryLocations.map(loc => 
                            `<option value="${loc.id}">${loc.name}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * Attach listeners to dropdowns
     */
/**
 * Attach listeners to dropdowns
 */
attachDropdownListeners() {
    // Only attach listeners to dropdowns in the CURRENT container
    const dropdowns = this.containerElement.querySelectorAll('.route-dropdown');
    
    dropdowns.forEach((dropdown, index) => {
        dropdown.addEventListener('change', () => {
            this.handleDropdownChange(index);
        });
    });
}

    /**
     * Handle dropdown selection change
     */
    handleDropdownChange(stopIndex) {
    console.log('=== handleDropdownChange called ===');
    console.log('stopIndex:', stopIndex);
    console.log('containerElement:', this.containerElement);
    console.log('Is help?', this.containerElement === this.helpContainer);
    console.log('Is work?', this.containerElement === this.workContainer);
    
    // Only get dropdowns from the CURRENT task's container
    const dropdowns = Array.from(this.containerElement.querySelectorAll('.route-dropdown'));
    console.log('Found dropdowns:', dropdowns.length);
    
    const currentDropdown = dropdowns[stopIndex];
    console.log('Current dropdown:', currentDropdown);
    
    // ... rest of method stays the same
    
    // ... rest of the method stays exactly the same
        
        // Get previously selected value to re-enable it
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
        
        // Update map visualization
        this.updateRouteVisualization();
        
        // Check if all dropdowns are filled
        const allFilled = dropdowns.every(dd => dd.value !== '');
        
if (allFilled) {
    // Calculate and show distance (including return to origin)
    this.calculateAndShowDistance();
    
    // Enable submit button - SCOPE TO CONTAINER
    const submitBtn = this.containerElement.querySelector('.task-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
    } else {
        console.error('Submit button not found in handleDropdownChange');
    }
} else {
    // Hide distance estimate - SCOPE TO CONTAINER
    const distanceElement = this.containerElement.querySelector('#route-distance');
    const routePathElement = this.containerElement.querySelector('#route-path');
    
    if (distanceElement) {
        distanceElement.textContent = '--';
    }
    if (routePathElement) {
        routePathElement.innerHTML = `Route: ${this.currentTask.startLocation.name} → ...`;
    }
    
    // Disable submit button - SCOPE TO CONTAINER
    const submitBtn = this.containerElement.querySelector('.task-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}    }
    /**
     * Draw the map
     */
drawMap(canvasId) {
    if (!canvasId) {
        console.error('No canvas ID provided to drawMap');
        return;
    }
    
    const canvas = document.getElementById(canvasId);  // ✅ ADD THIS LINE
    if (!canvas) {
        console.error('Canvas not found:', canvasId);
        return;
    }
    
    console.log('Drawing map on canvas:', canvas);
    
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / this.gridSize;
    
    // ... rest stays the same
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    console.log('Drawing obstacles:', this.currentTask.obstacles.length);
    
    // Draw obstacles
    ctx.fillStyle = '#e74c3c';
    this.currentTask.obstacles.forEach(([x, y]) => {
        ctx.fillRect(
            x * cellSize + 2,
            y * cellSize + 2,
            cellSize - 4,
            cellSize - 4
        );
    });
    
    console.log('Drawing delivery locations:', this.currentTask.deliveryLocations.length);
    
    // Draw delivery locations
    this.currentTask.deliveryLocations.forEach(loc => {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(
            loc.x * cellSize + cellSize / 2,
            loc.y * cellSize + cellSize / 2,
            cellSize / 3,
            0,
            2 * Math.PI
        );
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            loc.id,
            loc.x * cellSize + cellSize / 2,
            loc.y * cellSize + cellSize / 2
        );
    });
    
    // Draw start location
    const start = this.currentTask.startLocation;
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(
        start.x * cellSize + cellSize / 2,
        start.y * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        2 * Math.PI
    );
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(
        'S',
        start.x * cellSize + cellSize / 2,
        start.y * cellSize + cellSize / 2
    );
    
    console.log('Map drawing complete');
}

    /**
     * Update route visualization on map
     */
updateRouteVisualization() {
    // Determine which canvas to use
    let canvasId;
    
    // Check practice first, but only if practice is NOT complete
    if (!this.practiceComplete && this.practiceContainer && this.containerElement === this.practiceContainer) {
        canvasId = 'routing-map-practice';
    } else if (this.helpContainer && this.containerElement === this.helpContainer) {
        canvasId = 'routing-map-help';
    } else if (this.workContainer && this.containerElement === this.workContainer) {
        canvasId = 'routing-map-work';
    } else {
        // Fallback
        console.warn('Could not identify container, defaulting to work');
        canvasId = 'routing-map-work';
    }
    
    this.drawMap(canvasId);
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Rest stays the same...
    
   
    // Rest of the method stays the same...
        
        const ctx = canvas.getContext('2d');
        const cellSize = canvas.width / this.gridSize;
        
        // Get current route from dropdowns FROM THE CURRENT CONTAINER ONLY
const dropdowns = Array.from(this.containerElement.querySelectorAll('.route-dropdown'));
const selectedIds = dropdowns.map(dd => dd.value).filter(v => v !== '');
        
        if (selectedIds.length === 0) return;
        
        // Build route: Start → selected stops → (back to start if all selected)
        const route = [this.currentTask.startLocation.id, ...selectedIds];
        if (selectedIds.length === 5) {
            route.push(this.currentTask.startLocation.id); // Return to origin
        }
        
        // Draw each segment with actual pathfinding
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < route.length - 1; i++) {
            const fromLoc = this.currentTask.locations.find(loc => loc.id === route[i]);
            const toLoc = this.currentTask.locations.find(loc => loc.id === route[i + 1]);
            
            if (fromLoc && toLoc) {
                // Get actual path using BFS
                const path = this.getPath(
                    {x: fromLoc.x, y: fromLoc.y},
                    {x: toLoc.x, y: toLoc.y}
                );
                
                // Draw the path
                if (path && path.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(
                        path[0].x * cellSize + cellSize / 2,
                        path[0].y * cellSize + cellSize / 2
                    );
                    
                    for (let j = 1; j < path.length; j++) {
                        ctx.lineTo(
                            path[j].x * cellSize + cellSize / 2,
                            path[j].y * cellSize + cellSize / 2
                        );
                    }
                    
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * Get actual path between two points using BFS (for visualization)
     */
    getPath(start, end) {
        // If same point
        if (start.x === end.x && start.y === end.y) {
            return [start];
        }

        // BFS to find path
        const queue = [[start.x, start.y, []]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (queue.length > 0) {
            const [x, y, path] = queue.shift();
            const currentPath = [...path, {x, y}];

            // Check all 4 directions
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                // Check if we reached the destination
                if (newX === end.x && newY === end.y) {
                    return [...currentPath, {x: newX, y: newY}];
                }

                const key = `${newX},${newY}`;

                // Check if valid and not visited
                if (this.pathfinder.isValid(newX, newY) && !visited.has(key)) {
                    visited.add(key);
                    queue.push([newX, newY, currentPath]);
                }
            }
        }

        // No path found
        return null;
    }

    /**
     * Calculate and show total distance
     */
calculateAndShowDistance() {
    // Only get dropdowns from the CURRENT task's container
    const dropdowns = Array.from(this.containerElement.querySelectorAll('.route-dropdown'));
    const selectedIds = dropdowns.map(dd => dd.value);
    
    // Build full route: Start → 5 stops → Back to Start
    const fullRoute = [
        this.currentTask.startLocation.id,
        ...selectedIds,
        this.currentTask.startLocation.id
    ];
    
    // Calculate total distance
    const totalDistance = this.pathfinder.calculateRouteDistance(
        this.currentTask.locations,
        fullRoute
    );
    
    // Update display - SCOPE TO CONTAINER
    const distanceElement = this.containerElement.querySelector('#route-distance');
    if (distanceElement) {
        distanceElement.textContent = totalDistance === Infinity ? 'Unreachable!' : totalDistance;
    }
    
    // Update route path display - SCOPE TO CONTAINER
    const routeNames = fullRoute.map(id => {
        const loc = this.currentTask.locations.find(l => l.id === id);
        return loc ? loc.name : id;
    });
    
    const routePathElement = this.containerElement.querySelector('#route-path');
    if (routePathElement) {
        routePathElement.innerHTML = `Route: ${routeNames.join(' → ')}`;
    }
}

/**
     * Submit task answer
     */
    submitRoute(isPractice = false, isHelping = false) {
    console.log('Submit route called:', isPractice, isHelping);
    console.log('Container element:', this.containerElement);

    // Only get dropdowns from the CURRENT task's container
    const dropdowns = Array.from(this.containerElement.querySelectorAll('.route-dropdown'));
    const selectedIds = dropdowns.map(dd => dd.value);
    
    // ... rest stays the same
        
        console.log('Selected route:', selectedIds);

        // Build full route
        const fullRoute = [
            this.currentTask.startLocation.id,
            ...selectedIds,
            this.currentTask.startLocation.id
        ];
        
        const totalDistance = this.pathfinder.calculateRouteDistance(
            this.currentTask.locations,
            fullRoute
        );
        
        const timeSpent = Date.now() - this.taskStartTime;
        
        // Calculate optimal distance (for quality measurement)
        const optimalDistance = this.calculateOptimalRoute();
        const efficiency = optimalDistance > 0 ? (optimalDistance / totalDistance) : 0;
        
        // Record the task
        const taskRecord = {
            taskId: this.currentTask.id,
            route: fullRoute,
            distance: totalDistance,
            optimalDistance: optimalDistance,
            efficiency: efficiency,
            efficiencyPercent: Math.round(efficiency * 100),
            timeSpent: timeSpent,
            timestamp: Date.now()
        };
        
        console.log('Route submitted:', fullRoute.join(' → '), 'Distance:', totalDistance);
        
        // Handle different submission types
        if (isPractice) {
            // ============ PRACTICE TASK ============
            const efficiencyPercent = Math.round(efficiency * 100);
            alert(
                `Practice complete!\n\n` +
                `Your route: ${totalDistance} units\n` +
                `Optimal route: ${optimalDistance} units\n` +
                `Efficiency: ${efficiencyPercent}%\n\n` +
                `${efficiency >= 0.9 ? '✨ Great job!' : '💡 Try to minimize distance!'}`
            );
            
            // Count the practice task as completed
            this.completedTasks.push(taskRecord);
            console.log('✓ Practice task counted. Total completed:', this.completedTasks.length);
            
            // Set flags IMMEDIATELY
            this.practiceComplete = true;
            console.log('✓ Task system practice flag set to:', this.practiceComplete);
            
            // Notify tutorial that practice is complete AND advance it
            if (this.experiment.tutorial && this.experiment.tutorial.isActive) {
                this.experiment.tutorial.practiceTaskDone = true;
                console.log('✓ Tutorial practice flag set to:', this.experiment.tutorial.practiceTaskDone);
                
                // Trigger tutorial to advance immediately
                console.log('🚀 Forcing tutorial to advance now...');
                this.experiment.tutorial.forceAdvance();
            }
            
            console.log('✓ Practice task complete - tutorial advancing');
            
} else if (isHelping) {
    // ============ HELPING TASK ============
    if (this.experiment.tracker && this.experiment.tracker.isTracking) {
        this.experiment.tracker.recordHelpTask(
            this.currentTask.id,
            fullRoute.join(','),
            timeSpent,
            { 
                efficiency: efficiency,
                efficiencyPercent: Math.round(efficiency * 100),
                distance: totalDistance,
                optimalDistance: optimalDistance
            }
        );
        
        console.log('Help task recorded. Total help tasks:', this.experiment.tracker.helpTasks.completed);
    }
    
    // Show feedback
    this.showFeedback(totalDistance, optimalDistance, efficiency);
    
    // Update help counter in overlay
    console.log('Updating help stats...');
    this.updateHelpStats();
    
    // Generate next help task after brief delay
    setTimeout(() => {
        this.showTaskInterface(this.containerElement, false, true);
    }, 1000);
            
} else {
    // ============ REGULAR TASK (FREE PLAY) ============
    if (this.experiment.tracker && this.experiment.tracker.isTracking) {
        this.experiment.tracker.recordWorkTask(
            this.currentTask.id,
            fullRoute.join(','),
            timeSpent,
            {
                efficiency: efficiency,
                efficiencyPercent: Math.round(efficiency * 100),
                distance: totalDistance,
                optimalDistance: optimalDistance
            }
        );
        
        console.log('Work task recorded. Total work tasks:', this.experiment.tracker.workTasks.completed);
    }
    
    // Show feedback
    this.showFeedback(totalDistance, optimalDistance, efficiency);
    
    // Update work stats counter in panel
    if (this.experiment.panelManager) {
        console.log('Updating work panel stats...');
        this.experiment.panelManager.updateWorkStats();
    }
    
    // Generate next task after brief delay
    setTimeout(() => {
        this.showTaskInterface(this.containerElement, false, false);
    }, 1000);
}
    }
    /**
     * Calculate optimal route distance (brute force for small n=5)
     */
    calculateOptimalRoute() {
        // Get all delivery locations (excluding start)
        const deliveryIds = this.currentTask.deliveryLocations.map(loc => loc.id);
        
        // Generate all permutations
        const permutations = this.generatePermutations(deliveryIds);
        
        let minDistance = Infinity;
        
        // Try each permutation
        permutations.forEach(perm => {
            const route = [
                this.currentTask.startLocation.id,
                ...perm,
                this.currentTask.startLocation.id
            ];
            
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

    /**
     * Generate all permutations of an array
     */
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

    /**
     * Show feedback after submission
     */
    showFeedback(userDistance, optimalDistance, efficiency) {
        const percentage = Math.round(efficiency * 100);
        
        let performanceMessage = '';
        if (efficiency >= 1.0) {
            performanceMessage = '🎉 Perfect! You found the optimal route!';
        } else if (efficiency >= 0.95) {
            performanceMessage = '✨ Excellent! Very close to optimal!';
        } else if (efficiency >= 0.85) {
            performanceMessage = '👍 Good job! Pretty efficient route.';
        } else if (efficiency >= 0.75) {
            performanceMessage = '📝 Not bad. Try to find shorter routes!';
        } else {
            performanceMessage = '💡 There\'s room for improvement. Keep trying!';
        }
        
        alert(
            `${performanceMessage}\n\n` +
            `Your route: ${userDistance} units\n` +
            `Optimal route: ${optimalDistance} units\n` +
            `Efficiency: ${percentage}%`
        );
    }
    /**
     * Get performance statistics
     */
/**
 * Get count of work tasks completed
 */
getWorkTaskCount() {
    if (!this.experiment.tracker) return 0;
    return this.experiment.tracker.getWorkTaskCount();
}

/**
 * Get count of help tasks completed
 */
getHelpTaskCount() {
    if (!this.experiment.tracker) return 0;
    return this.experiment.tracker.getHelpTaskCount();
}

/**
 * Update help task counter in overlay
 */
/**
 * Update help task counter in overlay
 */
updateHelpStats() {
    const counterElement = document.getElementById('help-completed-count');
    
    if (counterElement && this.experiment.tracker) {
        const helpCount = this.getHelpTaskCount();
        const helpData = this.experiment.tracker.helpTasks;
        const avgEfficiency = helpData.completed > 0 
            ? Math.round((helpData.totalEfficiency / helpData.completed) * 100)
            : 0;
        
        counterElement.textContent = `Routes completed for Alex: ${helpCount} (Avg: ${avgEfficiency}%)`;
    }
}

/**
 * Get performance statistics
 */
getPerformanceStats() {
    if (!this.experiment.tracker) {
        return {
            total: 0,
            averageEfficiency: 0,
            averageEfficiencyPercent: 0,
            avgTimeMs: 0,
            tasks: []
        };
    }
    
    const workData = this.experiment.tracker.workTasks;
    
    return {
        total: workData.completed,
        averageEfficiency: workData.completed > 0 
            ? workData.totalEfficiency / workData.completed 
            : 0,
        averageEfficiencyPercent: workData.completed > 0 
            ? Math.round((workData.totalEfficiency / workData.completed) * 100)
            : 0,
        avgTimeMs: workData.completed > 0 
            ? Math.round(workData.totalTime / workData.completed)
            : 0,
        tasks: workData.tasks
    };
}

/**
     * Clear current task display
     */
    clearTaskDisplay() {
        if (this.containerElement) {
            this.containerElement.innerHTML = '<p class="placeholder">Loading new route assignment...</p>';
        }
    }

    /**
     * Start fresh task session (called when free play begins)
     */
/**
 * Start fresh task session (called when free play begins)
 */
startFreshSession() {
    console.log('Starting fresh task session for free play');
    
    // DON'T clear completedTasks - keep the practice task counted
    // Just clear the display
    this.clearTaskDisplay();
    
    // Generate and show a new task
    if (this.containerElement) {
        // Small delay to make the transition smooth
        setTimeout(() => {
            this.showTaskInterface(this.containerElement, false, false);
            console.log('✓ New task generated for free play (practice task still counted)');
        }, 500);
    }
}

}