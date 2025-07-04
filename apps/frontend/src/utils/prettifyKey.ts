export function prettifyKey(key: string) {
  return key
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
}

