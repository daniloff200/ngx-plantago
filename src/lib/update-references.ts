const replacements: [RegExp, string][] = [
  //Update imports from 'shared/... to 'app/shared/...
  [/'shared\//g, '\'app/shared/'],

  //Update imports from 'modules/... to 'app/modules/...
  [/'modules\//g, '\'app/modules/'],

  //Update path to images
  //[/(['`])src\/img\//g, '$1img/'],

  //Update path to images and data
  [/(['`])(src\/)?(img|data)\//g, '$1assets/$3/'],

  // Update path to dependencies
  [/!shared\/dependencies\//g, '!app/shared/dependencies/'],
];

export function updateReferences(results: string) {
  for (const r of replacements) {
    results = results.replace(r[0], r[1]);
  }

  return results;
}
