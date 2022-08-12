import { Text, Container, List, Anchor } from '@mantine/core';
import { InferGetServerSidePropsType } from 'next';

export const getServerSideProps = async () => {
  const res = await fetch('http://localhost:8080/api/v1/parameter');
  const parameters: string[] = await res.json();

  return { props: { parameters } };
};

export default function IndexPage({
  parameters,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Container size="sm">
      <Text component="h1">All parameters</Text>
      <List>
        {parameters.map((p, index) => (
          <List.Item key={index}>{p}</List.Item>
        ))}
      </List>
      <Anchor component="a" href="/parameters/create">
        Create new Layer
      </Anchor>
    </Container>
  );
}
