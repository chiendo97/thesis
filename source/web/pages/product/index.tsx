import { Anchor, Card, Container, Grid, Table, Text } from '@mantine/core';
import type { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { SummaryProduct } from '../../types/api';

export const getServerSideProps = async () => {
  const res = await fetch('http://localhost:8080/api/v1/summary');
  const products: SummaryProduct[] = await res.json();

  return { props: { products } };
};

export default function IndexPage({
  products,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Container size="md">
      <Grid grow gutter="md">
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text component="h2" variant="gradient" color="primary">
              Product list
            </Text>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>No. of Layer</th>
                </tr>
              </thead>
              <tbody>
                {products.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.id}</td>
                    <td>
                      <Anchor component="a" href={`/product/${entity.id}`}>
                        {entity.name}
                      </Anchor>
                    </td>
                    <td>{entity.layers.length}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Anchor href="/product/create" component="a">
              Create new Product
            </Anchor>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
