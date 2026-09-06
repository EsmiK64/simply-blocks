import { javascriptGenerator, Order as JsOrder } from 'blockly/javascript';
import { pythonGenerator, Order as PyOrder } from 'blockly/python';

let generatorsRegistered = false;

export function registerGenerators() {
    if (generatorsRegistered) {
        return;
    }

    // ── Events ─────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['event_whenflagclicked'] = function () {
        return '# When green flag clicked\n';
    };

    javascriptGenerator.forBlock['event_whenflagclicked'] = function () {
        return '// When green flag clicked\n';
    };

    pythonGenerator.forBlock['event_whenkeypressed'] = function (block) {
        const key = block.getFieldValue('KEY_OPTION') || 'space';

        return `# When [${key}] key pressed\n`;
    };

    javascriptGenerator.forBlock['event_whenkeypressed'] = function (block) {
        const key = block.getFieldValue('KEY_OPTION') || 'space';

        return `// When [${key}] key pressed\n`;
    };

    pythonGenerator.forBlock['event_whenthisspriteclicked'] = function () {
        return '# When this sprite clicked\n';
    };

    javascriptGenerator.forBlock['event_whenthisspriteclicked'] = function () {
        return '// When this sprite clicked\n';
    };

    // ── Motion ─────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['motion_movesteps'] = function (block, generator) {
        const steps =
            generator.valueToCode(block, 'STEPS', PyOrder.ATOMIC) || '10';

        return `sprite.forward(${steps})\n`;
    };

    javascriptGenerator.forBlock['motion_movesteps'] = function (
        block,
        generator,
    ) {
        const steps =
            generator.valueToCode(block, 'STEPS', JsOrder.ATOMIC) || '10';

        return `sprite.forward(${steps});\n`;
    };

    pythonGenerator.forBlock['motion_turnright'] = function (block, generator) {
        const deg =
            generator.valueToCode(block, 'DEGREES', PyOrder.ATOMIC) || '15';

        return `sprite.right(${deg})\n`;
    };

    javascriptGenerator.forBlock['motion_turnright'] = function (
        block,
        generator,
    ) {
        const deg =
            generator.valueToCode(block, 'DEGREES', JsOrder.ATOMIC) || '15';

        return `sprite.right(${deg});\n`;
    };

    pythonGenerator.forBlock['motion_turnleft'] = function (block, generator) {
        const deg =
            generator.valueToCode(block, 'DEGREES', PyOrder.ATOMIC) || '15';

        return `sprite.left(${deg})\n`;
    };

    javascriptGenerator.forBlock['motion_turnleft'] = function (
        block,
        generator,
    ) {
        const deg =
            generator.valueToCode(block, 'DEGREES', JsOrder.ATOMIC) || '15';

        return `sprite.left(${deg});\n`;
    };

    pythonGenerator.forBlock['motion_gotoxy'] = function (block, generator) {
        const x = generator.valueToCode(block, 'X', PyOrder.ATOMIC) || '0';
        const y = generator.valueToCode(block, 'Y', PyOrder.ATOMIC) || '0';

        return `sprite.goto(${x}, ${y})\n`;
    };

    javascriptGenerator.forBlock['motion_gotoxy'] = function (
        block,
        generator,
    ) {
        const x = generator.valueToCode(block, 'X', JsOrder.ATOMIC) || '0';
        const y = generator.valueToCode(block, 'Y', JsOrder.ATOMIC) || '0';

        return `sprite.goto(${x}, ${y});\n`;
    };

    pythonGenerator.forBlock['motion_setx'] = function (block, generator) {
        const x = generator.valueToCode(block, 'X', PyOrder.ATOMIC) || '0';

        return `sprite.x = ${x}\n`;
    };

    pythonGenerator.forBlock['motion_changexby'] = function (block, generator) {
        const dx = generator.valueToCode(block, 'DX', PyOrder.ATOMIC) || '10';

        return `sprite.x += ${dx}\n`;
    };

    pythonGenerator.forBlock['motion_sety'] = function (block, generator) {
        const y = generator.valueToCode(block, 'Y', PyOrder.ATOMIC) || '0';

        return `sprite.y = ${y}\n`;
    };

    pythonGenerator.forBlock['motion_changeyby'] = function (block, generator) {
        const dy = generator.valueToCode(block, 'DY', PyOrder.ATOMIC) || '10';

        return `sprite.y += ${dy}\n`;
    };

    pythonGenerator.forBlock['motion_xposition'] = function () {
        return ['sprite.x', PyOrder.ATOMIC];
    };

    pythonGenerator.forBlock['motion_yposition'] = function () {
        return ['sprite.y', PyOrder.ATOMIC];
    };

    pythonGenerator.forBlock['motion_direction'] = function () {
        return ['sprite.direction', PyOrder.ATOMIC];
    };

    // ── Looks ──────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['looks_sayforsecs'] = function (block, generator) {
        const msg =
            generator.valueToCode(block, 'MESSAGE', PyOrder.ATOMIC) ||
            '"Hello!"';
        const secs =
            generator.valueToCode(block, 'SECS', PyOrder.ATOMIC) || '2';

        return `sprite.say(${msg}, ${secs})\n`;
    };

    pythonGenerator.forBlock['looks_say'] = function (block, generator) {
        const msg =
            generator.valueToCode(block, 'MESSAGE', PyOrder.ATOMIC) ||
            '"Hello!"';

        return `sprite.say(${msg})\n`;
    };

    javascriptGenerator.forBlock['looks_say'] = function (block, generator) {
        const msg =
            generator.valueToCode(block, 'MESSAGE', JsOrder.ATOMIC) ||
            '"Hello!"';

        return `sprite.say(${msg});\n`;
    };

    pythonGenerator.forBlock['looks_thinkforsecs'] = function (
        block,
        generator,
    ) {
        const msg =
            generator.valueToCode(block, 'MESSAGE', PyOrder.ATOMIC) ||
            '"Hmm..."';
        const secs =
            generator.valueToCode(block, 'SECS', PyOrder.ATOMIC) || '2';

        return `sprite.think(${msg}, ${secs})\n`;
    };

    pythonGenerator.forBlock['looks_think'] = function (block, generator) {
        const msg =
            generator.valueToCode(block, 'MESSAGE', PyOrder.ATOMIC) ||
            '"Hmm..."';

        return `sprite.think(${msg})\n`;
    };

    pythonGenerator.forBlock['looks_show'] = function () {
        return 'sprite.show()\n';
    };

    pythonGenerator.forBlock['looks_hide'] = function () {
        return 'sprite.hide()\n';
    };

    pythonGenerator.forBlock['looks_changesizeby'] = function (
        block,
        generator,
    ) {
        const change =
            generator.valueToCode(block, 'CHANGE', PyOrder.ATOMIC) || '10';

        return `sprite.size += ${change}\n`;
    };

    pythonGenerator.forBlock['looks_setsizeto'] = function (block, generator) {
        const size =
            generator.valueToCode(block, 'SIZE', PyOrder.ATOMIC) || '100';

        return `sprite.size = ${size}\n`;
    };

    // ── Sound ──────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['sound_playuntildone'] = function (block) {
        const snd = block.getFieldValue('SOUND_MENU') || 'meow';

        return `sound.play_until_done("${snd}")\n`;
    };

    pythonGenerator.forBlock['sound_play'] = function (block) {
        const snd = block.getFieldValue('SOUND_MENU') || 'meow';

        return `sound.play("${snd}")\n`;
    };

    pythonGenerator.forBlock['sound_stopallsounds'] = function () {
        return 'sound.stop_all()\n';
    };

    // ── Control ────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['control_wait'] = function (block, generator) {
        const dur =
            generator.valueToCode(block, 'DURATION', PyOrder.ATOMIC) || '1';

        return `time.sleep(${dur})\n`;
    };

    pythonGenerator.forBlock['control_repeat'] = function (block, generator) {
        const times =
            generator.valueToCode(block, 'TIMES', PyOrder.ATOMIC) || '10';
        const branch =
            generator.statementToCode(block, 'SUBSTACK') || '    pass\n';

        return `for _ in range(${times}):\n${branch}`;
    };

    pythonGenerator.forBlock['control_forever'] = function (block, generator) {
        const branch =
            generator.statementToCode(block, 'SUBSTACK') || '    pass\n';

        return `while True:\n${branch}`;
    };

    pythonGenerator.forBlock['control_if'] = function (block, generator) {
        const cond =
            generator.valueToCode(block, 'CONDITION', PyOrder.ATOMIC) || 'True';
        const branch =
            generator.statementToCode(block, 'SUBSTACK') || '    pass\n';

        return `if ${cond}:\n${branch}`;
    };

    pythonGenerator.forBlock['control_if_else'] = function (block, generator) {
        const cond =
            generator.valueToCode(block, 'CONDITION', PyOrder.ATOMIC) || 'True';
        const branch1 =
            generator.statementToCode(block, 'SUBSTACK') || '    pass\n';
        const branch2 =
            generator.statementToCode(block, 'SUBSTACK2') || '    pass\n';

        return `if ${cond}:\n${branch1}else:\n${branch2}`;
    };

    pythonGenerator.forBlock['control_stop'] = function () {
        return 'sys.exit()\n';
    };

    // ── Sensing ────────────────────────────────────────────────────────────
    pythonGenerator.forBlock['sensing_mousex'] = function () {
        return ['stage.mouse_x', PyOrder.ATOMIC];
    };

    pythonGenerator.forBlock['sensing_mousey'] = function () {
        return ['stage.mouse_y', PyOrder.ATOMIC];
    };

    pythonGenerator.forBlock['sensing_timer'] = function () {
        return ['stage.timer', PyOrder.ATOMIC];
    };

    pythonGenerator.forBlock['sensing_resettimer'] = function () {
        return 'stage.reset_timer()\n';
    };

    // ── Operators ──────────────────────────────────────────────────────────
    pythonGenerator.forBlock['operator_add'] = function (block, generator) {
        const a = generator.valueToCode(block, 'NUM1', PyOrder.ADDITIVE) || '0';
        const b = generator.valueToCode(block, 'NUM2', PyOrder.ADDITIVE) || '0';

        return [`${a} + ${b}`, PyOrder.ADDITIVE];
    };

    pythonGenerator.forBlock['operator_subtract'] = function (
        block,
        generator,
    ) {
        const a = generator.valueToCode(block, 'NUM1', PyOrder.ADDITIVE) || '0';
        const b = generator.valueToCode(block, 'NUM2', PyOrder.ADDITIVE) || '0';

        return [`${a} - ${b}`, PyOrder.ADDITIVE];
    };

    pythonGenerator.forBlock['operator_multiply'] = function (
        block,
        generator,
    ) {
        const a =
            generator.valueToCode(block, 'NUM1', PyOrder.MULTIPLICATIVE) || '0';
        const b =
            generator.valueToCode(block, 'NUM2', PyOrder.MULTIPLICATIVE) || '0';

        return [`${a} * ${b}`, PyOrder.MULTIPLICATIVE];
    };

    pythonGenerator.forBlock['operator_divide'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'NUM1', PyOrder.MULTIPLICATIVE) || '0';
        const b =
            generator.valueToCode(block, 'NUM2', PyOrder.MULTIPLICATIVE) || '1';

        return [`${a} / ${b}`, PyOrder.MULTIPLICATIVE];
    };

    pythonGenerator.forBlock['operator_random'] = function (block, generator) {
        const from =
            generator.valueToCode(block, 'FROM', PyOrder.ATOMIC) || '1';
        const to = generator.valueToCode(block, 'TO', PyOrder.ATOMIC) || '10';

        return [`random.randint(${from}, ${to})`, PyOrder.FUNCTION_CALL];
    };

    pythonGenerator.forBlock['operator_lt'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND1', PyOrder.RELATIONAL) || '0';
        const b =
            generator.valueToCode(block, 'OPERAND2', PyOrder.RELATIONAL) || '0';

        return [`${a} < ${b}`, PyOrder.RELATIONAL];
    };

    pythonGenerator.forBlock['operator_equals'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND1', PyOrder.RELATIONAL) || '0';
        const b =
            generator.valueToCode(block, 'OPERAND2', PyOrder.RELATIONAL) || '0';

        return [`${a} == ${b}`, PyOrder.RELATIONAL];
    };

    pythonGenerator.forBlock['operator_gt'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND1', PyOrder.RELATIONAL) || '0';
        const b =
            generator.valueToCode(block, 'OPERAND2', PyOrder.RELATIONAL) || '0';

        return [`${a} > ${b}`, PyOrder.RELATIONAL];
    };

    pythonGenerator.forBlock['operator_and'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND1', PyOrder.LOGICAL_AND) ||
            'False';
        const b =
            generator.valueToCode(block, 'OPERAND2', PyOrder.LOGICAL_AND) ||
            'False';

        return [`${a} and ${b}`, PyOrder.LOGICAL_AND];
    };

    pythonGenerator.forBlock['operator_or'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND1', PyOrder.LOGICAL_OR) ||
            'False';
        const b =
            generator.valueToCode(block, 'OPERAND2', PyOrder.LOGICAL_OR) ||
            'False';

        return [`${a} or ${b}`, PyOrder.LOGICAL_OR];
    };

    pythonGenerator.forBlock['operator_not'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'OPERAND', PyOrder.LOGICAL_NOT) ||
            'False';

        return [`not ${a}`, PyOrder.LOGICAL_NOT];
    };

    pythonGenerator.forBlock['operator_join'] = function (block, generator) {
        const a =
            generator.valueToCode(block, 'STRING1', PyOrder.ADDITIVE) || '""';
        const b =
            generator.valueToCode(block, 'STRING2', PyOrder.ADDITIVE) || '""';

        return [`str(${a}) + str(${b})`, PyOrder.ADDITIVE];
    };

    // ── Variables ──────────────────────────────────────────────────────────
    pythonGenerator.forBlock['data_setvariableto'] = function (
        block,
        generator,
    ) {
        const varName = block.getField('VARIABLE')?.getText() || 'my_variable';
        const safeVar = varName.replace(/\s+/g, '_');
        const val =
            generator.valueToCode(block, 'VALUE', PyOrder.ATOMIC) || '0';

        return `${safeVar} = ${val}\n`;
    };

    pythonGenerator.forBlock['data_changevariableby'] = function (
        block,
        generator,
    ) {
        const varName = block.getField('VARIABLE')?.getText() || 'my_variable';
        const safeVar = varName.replace(/\s+/g, '_');
        const val =
            generator.valueToCode(block, 'VALUE', PyOrder.ATOMIC) || '1';

        return `${safeVar} += ${val}\n`;
    };

    generatorsRegistered = true;
}
