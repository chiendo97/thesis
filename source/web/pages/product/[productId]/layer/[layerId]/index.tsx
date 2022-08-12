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
import { Status, Type } from '@Types/entities';
import moment from 'moment';
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
  const { productId, layerId } = router.query;

  const product = products.find((entity) => entity.id.toString() === (productId as string));
  if (!product) {
    return <>404</>;
  }

  const layer = product.layers.find((entity) => entity.id.toString() === (layerId as string));
  if (!layer) {
    return <>404</>;
  }

  return (
    <Container size="md">
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Card withBorder radius="md" shadow="sm">
            <Group position="apart">
              <Breadcrumbs>
                <Anchor href={`/product/${productId}`}>{product.name}</Anchor>
                <Anchor href="#">{layer.name}</Anchor>
              </Breadcrumbs>
              <Button
                onClick={() => {
                  router.push(`/product/${productId}/layer/${layerId}/update`);
                }}
              >
                Update
              </Button>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Hash Strategy</Text>
            <Text>{layer.type === Type.USER_ID ? 'By UserId' : 'By SessionId'}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Unused Traffic</Text>
            <Text>{layer.unused_traffic}%</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Experiments</Text>
            <Text>{layer.experiments.length}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card withBorder radius="md" shadow="sm">
            <Text component="h2" variant="gradient" color="primary">
              Experiment list
            </Text>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Traffic</th>
                  <th>Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>No. of Group</th>
                </tr>
              </thead>
              <tbody>
                {layer.experiments.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.id}</td>
                    <td>
                      <Anchor
                        component="a"
                        href={`/product/${productId}/layer/${layerId}/experiment/${entity.id}`}
                      >
                        {entity.name}
                      </Anchor>
                    </td>
                    <td>{entity.traffic}%</td>
                    <td>{entity.status === Status.START ? 'Started' : 'Ended'}</td>
                    <td>{moment(entity.start_time * 1000).format('DD/MM/YYYY')}</td>
                    <td>{moment(entity.end_time * 1000).format('DD/MM/YYYY')}</td>
                    <td>{entity.groups.length}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Anchor component="a" href={`/product/${productId}/layer/${layerId}/experiment/create`}>
              Create new Experiment
            </Anchor>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
