import {
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Table,
  Text,
} from '@mantine/core';
import { SummaryProduct } from '@Types/api';
import { Type } from '@Types/entities';
import type { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

export const getServerSideProps = async () => {
  const res = await fetch('http://localhost:8080/api/v1/summary');
  const products: SummaryProduct[] = await res.json();

  return { props: { products } };
};

export default function IndexPage({
  products,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { productId } = router.query;

  const product = products.find((entity) => entity.id.toString() === (productId as string));
  if (!product) {
    return <>404</>;
  }

  const { layers } = product;

  return (
    <Container size="md">
      <Grid grow gutter="md">
        <Grid.Col span={12}>
          <Card withBorder radius="md" shadow="sm">
            <Group position="apart">
              <Breadcrumbs>
                <Anchor href="#">{product.name}</Anchor>
              </Breadcrumbs>
              <Button
                onClick={() => {
                  router.push(`/product/${productId}/update`);
                }}
              >
                Update
              </Button>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Layers</Text>
            <Text>{product.layers.length}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Experiments</Text>
            <Text>
              {product.layers.reduce((prev, layer) => prev + layer.experiments.length, 0)}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text component="h2" variant="gradient" color="primary">
              Layer list
            </Text>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Hash Strategy</th>
                  <th>No. of Experiment</th>
                </tr>
              </thead>
              <tbody>
                {layers.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.id}</td>
                    <td>
                      <Anchor component="a" href={`/product/${productId}/layer/${entity.id}`}>
                        {entity.name}
                      </Anchor>
                    </td>
                    <td>{entity.type === Type.USER_ID ? 'By UserId' : 'By SessionId'}</td>
                    <td>{entity.experiments.length}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Anchor component="a" href={`/product/${productId}/layer/create`}>
              Create new Layer
            </Anchor>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
