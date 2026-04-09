/**
 * PATHFINDING UTILITIES
 * BFS implementation for distance calculation
 * STATUS: IMPLEMENTED
 */

class Pathfinder {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.obstacles = new Set();
    }

    /**
     * Set obstacles on the grid
     */
    setObstacles(obstacleArray) {
        this.obstacles.clear();
        obstacleArray.forEach(([x, y]) => {
            this.obstacles.add(`${x},${y}`);
        });
    }

    /**
     * Check if a position is valid
     */
    isValid(x, y) {
        return x >= 0 && x < this.gridSize && 
               y >= 0 && y < this.gridSize && 
               !this.obstacles.has(`${x},${y}`);
    }

    /**
     * Calculate distance between two points using BFS
     * Returns the shortest path length (number of grid steps)
     */
    calculateDistance(start, end) {
        // If same point, distance is 0
        if (start.x === end.x && start.y === end.y) {
            return 0;
        }

        // BFS queue: [x, y, distance]
        const queue = [[start.x, start.y, 0]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        // Directions: up, down, left, right
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (queue.length > 0) {
            const [x, y, dist] = queue.shift();

            // Check all 4 directions
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                // Check if we reached the destination
                if (newX === end.x && newY === end.y) {
                    return dist + 1;
                }

                const key = `${newX},${newY}`;

                // Check if valid and not visited
                if (this.isValid(newX, newY) && !visited.has(key)) {
                    visited.add(key);
                    queue.push([newX, newY, dist + 1]);
                }
            }
        }

        // No path found
        return Infinity;
    }

    /**
     * Calculate total route distance
     */
    calculateRouteDistance(locations, route) {
        let totalDistance = 0;

        for (let i = 0; i < route.length - 1; i++) {
            const fromLoc = locations.find(loc => loc.id === route[i]);
            const toLoc = locations.find(loc => loc.id === route[i + 1]);

            if (!fromLoc || !toLoc) {
                return Infinity;
            }

            const segmentDist = this.calculateDistance(
                {x: fromLoc.x, y: fromLoc.y},
                {x: toLoc.x, y: toLoc.y}
            );

            if (segmentDist === Infinity) {
                return Infinity; // Unreachable
            }

            totalDistance += segmentDist;
        }

        return totalDistance;
    }
}