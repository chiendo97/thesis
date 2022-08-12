import {
  Text,
  Button,
  Group,
  Container,
  Select,
  NumberInput,
  Table,
  Divider,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Prism } from '@mantine/prism';
import { ABTest, ABTestRequest, SummaryProduct } from '@Types/api';
import { InferGetServerSidePropsType } from 'next';
import { useState } from 'react';

export const getServerSideProps = async () => {
  const res = await fetch('http://localhost:8080/api/v1/summary');
  const products: SummaryProduct[] = await res.json();

  return { props: { products } };
};

export default function IndexPage({
  products,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const form = useForm({
    initialValues: {} as ABTestRequest,
    validate: {},
  });

  const [abTest, setAbTest] = useState<ABTest[]>();

  const onSubmit = async (data: ABTestRequest) => {
    const resp = await fetch('/api/abtest', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result: ABTest[] = await resp.json();

    // alert(JSON.stringify(abtest));
    setAbTest(result);
  };

  const options = products.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <Container size="sm">
      <Text component="h1">Test an experiment</Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Select
          label="Product"
          placeholder="Pick one"
          required
          data={options}
          {...form.getInputProps('product_id')}
        />
        <NumberInput
          defaultValue={0}
          placeholder="UserId"
          label="UserId"
          required
          min={0}
          {...form.getInputProps('user_id')}
        />
        <NumberInput
          defaultValue={0}
          placeholder="SessionId"
          label="SessionId"
          required
          min={0}
          {...form.getInputProps('session_id')}
        />
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
      {abTest && (
        <>
          <Text component="h1">Raw Result</Text>
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Layer</th>
                <th>Experiment</th>
                <th>Test Group</th>
                <th>Parameter Name</th>
                <th>Parameter Value</th>
              </tr>
            </thead>
            <tbody>
              {abTest.map((abtest) => (
                <>
                  {abtest.parameters &&
                    abtest.parameters.map((parameter, index, parameters) => (
                      <tr key={abtest.group_id * 10 + index}>
                        {index === 0 && (
                          <>
                            <td rowSpan={parameters.length}>
                              <Anchor href={`/product/${abtest.product_id}`}>
                                {products.find((p) => p.id === abtest.product_id)!.name}
                              </Anchor>
                            </td>
                            <td rowSpan={parameters.length}>
                              <Anchor
                                href={`/product/${abtest.product_id}/layer/${abtest.layer_id}`}
                              >
                                {
                                  products
                                    .find((p) => p.id === abtest.product_id)!
                                    .layers.find((l) => l.id === abtest.layer_id)!.name
                                }
                              </Anchor>
                            </td>
                            <td rowSpan={parameters.length}>
                              <Anchor
                                href={`/product/${abtest.product_id}/layer/${abtest.layer_id}/experiment/${abtest.experiment_id}`}
                              >
                                {
                                  products
                                    .find((p) => p.id === abtest.product_id)!
                                    .layers.find((l) => l.id === abtest.layer_id)!
                                    .experiments.find((e) => e.id === abtest.experiment_id)!.name
                                }
                              </Anchor>
                            </td>
                            <td rowSpan={parameters.length}>
                              {
                                products
                                  .find((p) => p.id === abtest.product_id)!
                                  .layers.find((l) => l.id === abtest.layer_id)!
                                  .experiments.find((e) => e.id === abtest.experiment_id)!
                                  .groups.find((g) => g.id === abtest.group_id)!.name
                              }
                            </td>
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
          <Divider my="xl" />
          <Prism language="json">{JSON.stringify(abTest, null, 2)}</Prism>
        </>
      )}
    </Container>
  );
}
