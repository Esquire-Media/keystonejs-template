export function fetchGraphQLClient(url: string) {
    return (query: string, variables?: Record<string, any>) => {
      return fetch(url, {
        method: "POST",
        body: JSON.stringify({ query, variables }),
        headers: { "Content-Type": "application/json" },
      })
        .then((x) => x.json())
        .then(({ data, errors }) => {
          if (errors) {
            throw new Error(
              `GraphQL errors occurred:\n${errors
                .map((x: any) => x.message)
                .join("\n")}`
            );
          }
          return data;
        });
    };
  }
  export function createNestedString(fields: string[]): string {
    let nestedString = "";
    for (let i = fields.length - 1; i >= 0; i--) {
      if (i === fields.length - 1) {
        // First iteration (actually the last element of the array)
        nestedString = fields[i];
      } else {
        // Wrap the current field around the nestedString
        nestedString = `${fields[i]} { ${nestedString} }`;
      }
    }
    return nestedString;
  }
  export function selectNestedKey(path: string[], obj: any): any {
    let result = obj;
    for (const key of path) {
      if (result[key] === undefined) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  }

export type AnyObject = { [key: string]: any };

export function isObject(item: any): item is AnyObject {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target: any, source: any): AnyObject {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}