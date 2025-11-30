// config/pointsconfig.js
module.exports = {
    levels: {
        "1000": { 
            color: 0x4df9ff, 
            name: "Platino",
            roleId: "1442350334193172570"
        },
        "500": { 
            color: 0xd9b500, 
            name: "Oro",
            roleId: "1442350209958023198" 
        },
        "0": { 
            color: 0x346beb, 
            name: "Plata",
            roleId: "1442349282937147436"
        }
    },

    getLevel(points) {
        const sortedLevels = Object.keys(this.levels).sort((a, b) => b - a);
        
        for (const level of sortedLevels) {
            if (points >= parseInt(level)) {
                return { 
                    ...this.levels[level], 
                    requiredPoints: parseInt(level) 
                };
            }
        }
        
        return this.levels["0"];
    },

    getRoleLevels() {
        const roleLevels = {};
        Object.keys(this.levels).forEach(level => {
            if (this.levels[level].roleId) {
                roleLevels[level] = this.levels[level].roleId;
            }
        });
        return roleLevels;
    }
};