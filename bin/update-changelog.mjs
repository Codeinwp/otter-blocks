import { replaceInFile } from 'replace-in-file';


async function updateChangelog() {
	const options = {
		files: 'readme.txt',
		from: /== Changelog ==[\s\S]*?\[See changelog for all versions\]/,
		to: (match) => {
			return `== Changelog ==\n\n${process.env.nextReleaseNotes}\n\n[See changelog for all versions]`;
		},
		encoding: 'utf8',
	};
	try {
		const results = await replaceInFile(options);
		console.log('Replacement results:', results);
	} catch (error) {
		console.error('Error occurred:', error);
	}
}

updateChangelog();