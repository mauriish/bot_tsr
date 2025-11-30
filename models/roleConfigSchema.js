// models/roleConfigSchema.js
const mongoose = require('mongoose');

const roleConfigSchema = new mongoose.Schema({
    serverId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    roleLevels: { 
        type: Map,
        of: String,
        default: new Map() 
    }
});

// Opcional: Convertir el Map a Object para mejor visualización
roleConfigSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.roleLevels = doc.roleLevels instanceof Map ? 
            Object.fromEntries(doc.roleLevels) : 
            ret.roleLevels;
        return ret;
    }
});

module.exports = mongoose.model('RoleConfig', roleConfigSchema);