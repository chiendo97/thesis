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
import { Status } from '@Types/entities';
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
  const { productId, layerId, experimentId } = router.query;

  const product = products.find((entity) => entity.id.toString() === (productId as string));
  if (!product) {
    return <>404</>;
  }

  const layer = product.layers.find((entity) => entity.id.toString() === (layerId as string));
  if (!layer) {
    return <>404</>;
  }

  const experiment = layer.experiments.find(
    (entity) => entity.id.toString() === (experimentId as string)
  );
  if (!experiment) {
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
                <Anchor href={`/product/${productId}/layer/${layerId}`}>{layer.name}</Anchor>
                <Anchor href="#">{experiment.name}</Anchor>
              </Breadcrumbs>
              <Button
                onClick={() => {
                  router.push(
                    `/product/${productId}/layer/${layerId}/experiment/${experimentId}/update`
                  );
                }}
              >
                Update
              </Button>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Traffic</Text>
            <Text>{experiment.traffic}%</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Status</Text>
            <Text>{experiment.status === Status.START ? 'Started' : 'Ended'}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Test Group</Text>
            <Text>{experiment.groups.length}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius="md" shadow="sm">
            <Text>Start Time</Text>
            <Text>{moment(experiment.start_time * 1000).format('DD/MM/YYYY')}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius="md" shadow="sm">
            <Text>End Time</Text>
            <Text>{moment(experiment.end_time * 1000).format('DD/MM/YYYY')}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card withBorder radius="md" shadow="sm">
            <Text component="h2" variant="gradient" color="primary">
              Test Group list
            </Text>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Test Group Name</th>
                  <th>Parameter Name</th>
                  <th>Parameter Value</th>
                </tr>
              </thead>
              <tbody>
                {experiment.groups.map((entity) => (
                  <>
                    {entity.parameters &&
                      entity.parameters.map((parameter, index, parameters) => (
                        <tr key={entity.id * 10 + index}>
                          {index === 0 && (
                            <>
                              <td rowSpan={parameters.length}>{entity.id}</td>
                              <td rowSpan={parameters.length}>{entity.name}</td>
                            </>
                          )}
                          <td>{parameter.name}</td>
                          <td>{parameter.value}</td>
                        </tr>
                      ))}
                  </>
                ))}
              </tbody>
            </Table>
            <Anchor
              component="a"
              href={`/product/${productId}/layer/${layerId}/experiment/${experimentId}/group/create`}
            >
              Create new Test Group
            </Anchor>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
