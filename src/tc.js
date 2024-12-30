const Type = require("./Type");

class tc{
    tc(exp){
        if (this._isNumber(exp)){
            return Type.number;
        }

        if (this._isString(exp)){
            return Type.string;
        }

        throw `Uknown type fgor expression ${exp}.`;
    }

    _isNumber(exp){
        return typeof exp === 'number';
    }

    _isString(exp){
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }
}

module.exports = tc;