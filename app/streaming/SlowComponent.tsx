export default async function SlowComponent() {
  await new Promise<void>((resolve) => setTimeout(resolve, 3000));

  return <p>This content loaded after three seconds.</p>;
}
