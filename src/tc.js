const Type = require("./Type");
const TypeEnvironment = require("./TypeEnvironment");

class tc{
    constructor(){
        this.global = this._createGlobal();
    }

    tcGlobal(exp){
        return this._tcBody(exp, this.global);
    }

    _tcBody(body, env){
        if (body[0] === 'begin'){
            return this._tcBlock(body, env);
        }

        return this.tc(body, env);
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

        if (exp[0] === 'var'){
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

        if (exp[0] === 'begin'){
            const blockEnv = new TypeEnvironment({}, env);
            return this._tcBlock(exp, blockEnv);
        }

        if (exp[0] === 'set'){
            const [_, ref, value] = exp;

            const varType = this.tc(ref, env);
            const valueType = this.tc(value, env);
            
            return this._expect(valueType, varType, value, exp);
        }

        throw `Uknown type for expression ${exp}.`;
    }

    _tcBlock(exp, env){
        let result;

        const [_tag, ...expressions] = exp;

        expressions.forEach(e => {
            result = this.tc(e, env);
        });

        return result;
    }

    _isVariableName(exp){
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_:]+$/.test(exp);
    }

    _createGlobal(){
        return new TypeEnvironment({
            VERSION: Type.string
        });
    }

    _isNumber(exp){
        return typeof exp === 'number';
    }

    _isString(exp){
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isBinary(exp){
        return /^[+\-*/]$/.test(exp[0]);
    }

    _binary(exp, env){
        this._checkArity(exp, 2);

        const t1 = this.tc(exp[1], env);
        const t2 = this.tc(exp[2], env);

        const allowedTypes = this._getOperandTypesForOperator(exp[0]);

        this._expectOperatorType(t1, allowedTypes, exp);
        this._expectOperatorType(t2, allowedTypes, exp);

        return this._expect(t2, t1, exp[2], exp);
    }

    _getOperandTypesForOperator(operator){
        switch (operator){
            case '+':
                return [Type.number, Type.string];
            case '-':
                return [Type.number];
            case '*':
                return [Type.number];
            case '/':
                return [Type.number];
            default:
                throw `Uknown operator ${operator}.`;
        }
    }

    _expectOperatorType(type_, allowedTypes, exp){
        if (!allowedTypes.some(t => t.equals(type_))){
            throw `\nUnexpected type: ${type_} in ${exp}, allowed: ${allowedTypes}`;
        }
    }

    _expect(actualType, expectedType, value, exp){
        if (!actualType.equals(expectedType)){
            this._throw(actualType, expectedType, value, exp);
        }

        return actualType;
    }

    _throw(actualType, expectedType, value, exp){
        throw `\nExpected "${expectedType}" type for ${value} in ${exp}, but got "${actualType}" type.\n`;
    }

    _checkArity(exp, arity){
        if (exp.length - 1 !== arity){
            throw `\nOperator '${exp[0]}' expects ${arity} operands, ${exp.length - 1} given in ${exp}.\n`;
        }
    }
}

module.exports = tc;