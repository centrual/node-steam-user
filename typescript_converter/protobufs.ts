import {GlobSync} from 'glob';
import {exec} from 'child_process';
import {promises as Fs} from 'fs';

const protobufs = './protobufs/*.proto';

const generatePath = './typescript_version/protobufs/generated/';

const compiledProtoFile = `${generatePath}compiled.js`;
const compiledDeclarationFile = `${generatePath}compiled.d.ts`;
const loadFile = `${generatePath}_load.ts`;

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
			}
			resolve(stdout? stdout : stderr);
		});
	});
}

(async () => {
	const protobufFiles = new GlobSync(protobufs);
	const protoFilePaths: string[] = [];

	for (let filePath of protobufFiles.found) {
		const fileName = filePath.split('/').pop();
		protoFilePaths.push(`./protobufs/${fileName}`);
	}

	await execShellCommand(`pbjs --target static-module --out ${compiledProtoFile} --es6 --keep-case ${protoFilePaths.join(' ')}`);
	await execShellCommand(`pbts ${compiledProtoFile} -o ${compiledDeclarationFile}`);

	const loadFileContent = `import * as All from './compiled';
export default All;
`;

	await Fs.writeFile(loadFile, loadFileContent);
})();
