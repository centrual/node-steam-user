import {GlobSync} from 'glob';
import {join, resolve} from 'path';
import {promises as Fs} from 'fs';

const enumSources = './enums/**/*.js';
const exportDir = './typescript_version/enums/';
const resourceEnumsFile = './typescript_version/resources/enums.ts';

(async () => {
	const files = new GlobSync(enumSources);
	let enumsFileImports = `import SteamUser from '../index';\n\n`;
	let enumsFileAssigns = `\n\n`;

	for (let filePath of files.found) {
		const fileContent = require(resolve(filePath));
		const exportMap = new Map<string, number>();

		const filePathParts: any = filePath.split('/');
		const fileName = filePathParts[filePathParts.length - 1].replace('.js', '');

		for (let [key, value] of Object.entries<number>(fileContent)) {
			const intKey = parseInt(key);

			if (isNaN(intKey)) {
				exportMap.set(key, value);
			}
		}

		let exportContent = `enum ${fileName} {\n`;

		exportMap.forEach((val, key) => {
			exportContent += `\t${key} = ${val},\n`;
		});

		exportContent += `}\n\n`;
		exportContent += `export default ${fileName};\n`;

		const writeFilePath = join(exportDir, `${fileName}.ts`);
		await Fs.writeFile(writeFilePath, exportContent);
		console.log(`${writeFilePath} written.`);

		enumsFileImports += `import ${fileName} from '../enums/${fileName}';\n`;
		enumsFileAssigns += `SteamUser['${fileName}'] = ${fileName};\n`;
	}

	await Fs.writeFile(resourceEnumsFile, enumsFileImports + enumsFileAssigns);
})();
