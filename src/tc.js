const Type = require('./Type.js');
const TypeEnvironment = require('./TypeEnvironment.js');

class TC {
    constructor(){
        this.global = this._createGlobal();
    }

    _tcGlobal(exp){
        return this._tcBody(exp, this.global);
    }

    _tcBody(body, env){
        if (body[0] == 'begin'){
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

        if (this._isBoolean(exp)){
            return Type.boolean;
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

        if (exp[0] == 'if'){
            const [_tag, condition, consequent, alternate] = exp;

            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            const t2 = this.tc(consequent, env);
            const t3 = this.tc(alternate, env);

            return this._expect(t3, t2, exp, exp);
        }

        if (exp[0] == 'while'){
            const [_tag, condition, body] = exp;
            
            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            return this.tc(body, env);
        }

        if (exp[0] == 'def'){
            const [_tag, name, params, _retDel, returnTypeStr, body] = exp;
            return env.define(name, this._tcFunction(params, returnTypeStr, body, env, name));
        }

        if (exp[0] === 'lambda'){
            const [_tag, params, _retDel, returnTypeStr, body] = exp;
            return this._tcFunction(params, returnTypeStr, body, env, null);
        }

        if (this._isBinary(exp)){
            return this._binary(exp, env);
        }

        if (this._isBooleanBinary(exp)){
            return this._booleanBinary(exp, env);
        }

        if (Array.isArray(exp)){
            const fn = this.tc(exp[0], env);
            const argValues = exp.slice(1);

            const argTypes = argValues.map(arg => this.tc(arg, env));
            return this._checkFunctionCalls(fn, argTypes, env, exp);
        }

        throw `Uknown expression for type ${exp}!!`;
    }

    _checkFunctionCalls(fn, argTypes, env, exp){
        if (fn.paramTypes.length != argTypes.length){
            throw `\nFunction ${exp[0]} ${fn.getName()} expects ${fn.paramTypes.length} arguments, ${argTypes.length} given in ${exp}.\n`;
        }

        argTypes.forEach((argType, index) => {
            this._expect(argType, fn.paramTypes[index], argTypes[index], exp);
        });

        return fn.returnType;
    }

    _tcFunction(params, returnTypeStr, body, env, name){
        const returnType = Type.fromString(returnTypeStr);

        const paramsRecord = {};
        const paramTypes = [];

        params.forEach(([name, typeStr]) => {
            const paramType = Type.fromString(typeStr);
            paramsRecord[name] = paramType;
            paramTypes.push(paramType);
        });

        const fnEnv = new TypeEnvironment(paramsRecord, env);

        // to enable recursion, we add the function name to the environment
        fnEnv.define(name, new Type.Function({paramTypes: paramTypes, returnType: returnType}))

        const actualReturnType = this._tcBody(body, fnEnv);

        if (!returnType.equals(actualReturnType)){
            throw `Expected function ${body} to return ${returnType}, but got ${actualReturnType}`;
        }

        return new Type.Function({
            paramTypes: paramTypes,
            returnType: returnType
        });
    }

    _isBooleanBinary(exp){
        return (
            exp[0] === '==' ||
            exp[0] === '!=' ||
            exp[0] === '>=' ||
            exp[0] === '<=' ||
            exp[0] === '<' ||
            exp[0] === '>'
        );
    }

    _booleanBinary(exp, env){
        this._checkArity(exp, 2);

        const t1 = this.tc(exp[1], env);
        const t2 = this.tc(exp[2], env);

        this._expect(t2, t1, exp[2], exp);

        return Type.boolean;
    }

    _isBoolean(exp){
        return typeof exp === 'boolean' || exp === 'true' || exp === 'false';
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
            'sum': new Type.Function({paramTypes: [Type.number, Type.number], returnType: Type.number})
        });
    }
    
}

module.exports = TC;
