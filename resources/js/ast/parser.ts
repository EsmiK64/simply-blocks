import * as acorn from 'acorn';

interface ASTNode {
    type: string;
    start: number;
    end: number;
    [key: string]: any;
}

export function convertTextToBlocksXml(sourceCode: string): string {
    try {
        const ast = acorn.parse(sourceCode, { ecmaVersion: 2020, sourceType: 'module' }) as any;
        let xmlAccumulator = '<xml xmlns="https://developers.google.com/blockly/xml">';

        for (const statement of ast.body) {
            xmlAccumulator += compileASTNodeToBlock(statement, sourceCode);
        }

        xmlAccumulator += '</xml>';

        return xmlAccumulator;
    } catch (error) {
        throw new Error('Could not parse invalid text structures.');
    }
}

function compileASTNodeToBlock(node: ASTNode, originalSource: string): string {
    // If the statement maps directly to a standard library definition [cite: 18]:
    if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
        const callee = node.expression.callee;

        if (callee.type === 'Identifier' && callee.name === 'moveSteps') {
            const arg = node.expression.arguments[0];
            const stepsValue = arg && typeof arg.value === 'number' ? arg.value : 10;

            return `<block type="motion_movesteps">
                <field name="STEPS">${stepsValue}</field>
              </block>`;
        }
    }

    // Fallback pattern to prevent work or code data loss:
    const unparsedChunk = originalSource.substring(node.start, node.end);

    return `<block type="raw_code_fallback">
            <field name="RAW_TEXT">${escapeXmlEntities(unparsedChunk)}</field>
          </block>`;
}

function escapeXmlEntities(unsafeString: string): string {
    return unsafeString.replace(/[<>&'"]/g, (char) => {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return char;
        }
    });
}