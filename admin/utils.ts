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