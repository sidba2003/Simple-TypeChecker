const Type = require('./Type.js');

class TC {
    tc(exp){
        if (this._isNumber(exp)){
            return Type.number;
        }

        if (this._isString(exp)){
            return Type.string;
        }

        throw `Uknown expression for type ${exp}!!`;
    }

    _isNumber(exp){
        return typeof exp === 'number';
    }

    _isString(exp){
        return typeof exp === 'string' && exp[0] == '"' && exp.slice(-1) == '"';
    }
    
}

module.exports = TC;
