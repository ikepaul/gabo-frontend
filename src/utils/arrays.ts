function cycle<T>(array: T[], offset: number): T[] {
  const cycled: T[] = [];
  for (let index = 0; index < array.length; index++) {
    cycled[(index + offset) % array.length] = array[index];
  }
  return cycled;
}

export { cycle };
