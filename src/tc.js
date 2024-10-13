const Type = require('./Type.js');

class TC {
    tc(exp){
        if (this._isNumber(exp)){
            return Type.number;
        }

        if (this._isString(exp)){
            return Type.string;
        }

        if (this._isBinary(exp)){
            return this._binary(exp);
        }

        throw `Uknown expression for type ${exp}!!`;
    }

    _isBinary(exp){
        return /^[+\-*/]$/.test(exp[0]);
    }

    _binary(exp){
        this._checkArity(exp, 2);

        const t1 = this.tc(exp[1]);
        const t2 = this.tc(exp[2]);

        const acceptedTypes = this._acceptedTypes(exp[0])

        if (acceptedTypes.includes(t1) && acceptedTypes.includes(t2)){
            const actualTypes = [t1, t2];
            if(actualTypes.includes(Type.string) && actualTypes.includes(Type.number)){
                return this._expect(Type.string, Type.string, null, exp);
            }

            return this._expect(t2, t1, exp[2], exp);    
        }

        this._throw([t1, t2], acceptedTypes, [exp[1], exp[2]], exp);
    }

    _acceptedTypes(operator){
        if (operator === '+'){
            return [Type.string, Type.number];
        }

        return [Type.number];
    }

    _expect(actualType, expectedType, value, exp){
        if (!actualType.equals(expectedType)){
            this._throw(actualType, expectedType, value, exp);
        }

        return actualType;
    }

    _throw(actualType, expectedType, value, exp){
        throw `Expected type ${expectedType} for value ${value} in ${exp} but got ${actualType}`;
    }

    _checkArity(exp, arity){
        if (exp.length - 1 != 2){
            throw `${exp[0]} expects ${arity} operands, but given ${exp.length - 1} operands.`
        }
    }

    _isNumber(exp){
        return typeof exp === 'number';
    }

    _isString(exp){
        return typeof exp === 'string' && exp[0] == '"' && exp.slice(-1) == '"';
    }
    
}

module.exports = TC;
