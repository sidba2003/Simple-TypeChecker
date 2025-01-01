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

        if (this._isBoolean(exp)){
            return Type.boolean;
        }

        if (this._isBinary(exp)){
            return this._binary(exp, env);
        }

        if (this._isBooleanBinary(exp)){
            return this._booleanBinary(exp, env);
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

            if (ref[0] === 'prop'){
                const [_tag, instance, propName] = ref;
                const instanceType = this.tc(instance, env);
                
                const valueType = this.tc(value, env);
                const propType = instanceType.getField(propName);

                return this._expect(valueType, propType, value, exp);
            }

            const varType = this.tc(ref, env);
            const valueType = this.tc(value, env);
            
            return this._expect(valueType, varType, value, exp);
        }

        if (exp[0] === 'if'){
            const [_tag, condition, consequent, alternate] = exp;

            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            const t2 = this.tc(consequent, env);
            const t3 = this.tc(alternate, env);

            return this._expect(t3, t2, exp, exp);
        }

        if (exp[0] === 'while'){
            const [_tag, condition, body] = exp;

            const t1 = this.tc(condition, env);
            this._expect(t1, Type.boolean, condition, exp);

            return this.tc(body, env);
        }

        if (exp[0] === 'def'){
            const [_tag, name, params, _retDel, returnTypeStr, body] = exp;
            return env.define(name, this._tcFunction(name, params, returnTypeStr, body, env));
        }

        if (exp[0] === 'class'){
            const [_tag, name, superClassName, body] = exp;
            const superclass = Type[superClassName];

            const classType = new Type.class({name, superclass});

            Type[name] = env.define(name, classType);

            return this._tcBody(body, classType.env);
        }

        if (exp[0] === 'new'){
            const [_tag, className, ...argValues] = exp;

            const classType = Type[className];

            if (classType == null){
                throw `Uknown class ${className}.`;
            }

            const argTypes = argValues.map(arg => this.tc(arg, env));

            return this._checkFunctionCall(
                classType.getField('constructor'),
                [classType, ...argTypes],
                env, 
                exp
            );
        }

        if (exp[0] === 'prop'){
            const [_tag, instance, name] = exp;

            const instanceType = this.tc(instance, env);

            return instanceType.getField(name);
        }

        // if expression matches nothing and is an an array, then we assume it to be a function call
        if (Array.isArray(exp)){
            const fn = this.tc(exp[0], env);
            const argValues = exp.slice(1);

            const argTypes = argValues.map(arg => this.tc(arg, env));

            return this._checkFunctionCall(fn, argTypes, env, exp);
        }

        throw `Uknown type for expression ${exp}.`;
    }

    _checkFunctionCall(fn, argTypes, env, exp){
        if (fn.paramTypes.length !== argTypes.length){
            throw `\nFunction ${exp[0]} ${fn.getName()} expects ${fn.paramTypes.length} arguments, ${argTypes.length} given in ${exp}.\n`
        }

        argTypes.forEach((argType, index) => {
            this._expect(argType, fn.paramTypes[index], argTypes[index], exp);
        });

        return fn.returnType;
    }

    _tcFunction(functionName, params, returnTypeStr, body, env){
        const returnType = Type.fromString(returnTypeStr);

        const paramsRecord = {};
        const paramTypes= [];

        params.forEach(([name, typeStr]) => {
            const paramType = Type.fromString(typeStr);
            paramsRecord[name] = paramType;
            paramTypes.push(paramType);
        })

        paramsRecord[functionName] = new Type.function({functionName, paramTypes, returnType})

        const fnEnv = new TypeEnvironment(paramsRecord, env);

        const actualReturnTpye = this._tcBody(body, fnEnv);

        if (!returnType.equals(actualReturnTpye)){
            throw `Unexpected function ${body} to return ${returnType}, but got ${actualReturnTpye}.`;
        }

        return new Type.function({
            paramTypes,
            returnType
        });
    }

    _isBooleanBinary(exp){
        return (
            exp[0] === '==' ||
            exp[0] === '!=' ||
            exp[0] === '>=' ||
            exp[0] === '<=' ||
            exp[0] === '>' ||
            exp[0] === '<'
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