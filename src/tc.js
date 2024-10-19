const Type = require('./Type.js');
const TypeEnvironment = require('./TypeEnvironment.js');

class TC {
    constructor(){
        this.global = this._createGlobal();
    }

    tc(exp, env = this.global){
        if (this._isNumber(exp)){
            return Type.number;
        }

        if (this._isString(exp)){
            return Type.string;
        }

        if (this._isBinary(exp)){
            return this._binary(exp, env);
        }

        if (exp[0] == 'var'){
            const [_tag, name, value] = exp;

            const valueType = this.tc(value, env);

            if (Array.isArray(name)){
                const [varName, typeStr] = name;
                const expectedType = Type.fromString(typeStr);

                this._expect(valueType, expectedType, value, exp);
                return env.define(varName, expectedType);
            }
            return env.define(name, valueType);
        }

        if (this._isVariableName(exp)){
            return env.lookup(exp);
        }

        if (exp[0] == 'set'){
            const [_, ref, value] = exp;

            const valueType = this.tc(value, env);
            const varType = this.tc(ref, env);

            return this._expect(valueType, varType, value, exp);
        }

        if (exp[0] == 'begin'){
            const blockEnv = new TypeEnvironment({}, env);
            return this._tcBlock(exp, blockEnv);
        }

        throw `Uknown expression for type ${exp}!!`;
    }

    _tcBlock(block, env){
        let result;

        const [_tag, ...expressions] = block;

        expressions.forEach(exp => {
            result = this.tc(exp, env);
        });

        return result;
    }

    _isVariableName(exp){
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_:]+$/.test(exp);
    }

    _isBinary(exp){
        return /^[+\-*/]$/.test(exp[0]);
    }

    _binary(exp, env){
        this._checkArity(exp, 2);

        const t1 = this.tc(exp[1], env);
        const t2 = this.tc(exp[2], env);

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

    _createGlobal(){
        return new TypeEnvironment({
            VERSION: Type.string,
        });
    }
    
}

module.exports = TC;
