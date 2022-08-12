import { Text, TextInput, Button, Group, Container, Select, NumberInput } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { APIExperiment, SummaryProduct } from '@Types/api';
import { Status } from '@Types/entities';
import moment from 'moment';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

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

  const form = useForm({
    initialValues: {} as APIExperiment,
    validate: {},
  });

  const onSubmit = async (data: APIExperiment) => {
    // alert(JSON.stringify(data));

    await fetch('http://localhost:8080/api/v1/experiment/create', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        layer_id: Number(layerId as string),
      } as APIExperiment),
    });

    router.push(`/product/${productId}/layer/${layerId}`);
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Create new Experiment
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Layer's name"
          {...form.getInputProps('name')}
        />
        <NumberInput
          defaultValue={0}
          placeholder="Traffic"
          label="Traffic"
          description={`From 0 to ${layer.unused_traffic}%`}
          required
          max={layer.unused_traffic}
          min={0}
          step={5}
          {...form.getInputProps('traffic')}
        />
        <DateRangePicker
          label="Range"
          placeholder="Pick dates range"
          required
          value={[
            moment((form.values.start_time || moment().unix()) * 1000).toDate(),
            moment((form.values.end_time || moment().unix()) * 1000).toDate(),
          ]}
          onChange={(ranges) => {
            if (ranges[0]) {
              const startTime = ranges[0].getTime() / 1000;
              form.setFieldValue('start_time', startTime);
            }
            if (ranges[1]) {
              const endTime = ranges[1].getTime() / 1000;
              form.setFieldValue('end_time', endTime);
            }
          }}
        />
        <Select
          label="Status"
          placeholder="Pick one"
          required
          data={[
            { value: Status.START, label: 'Started' },
            { value: Status.END, label: 'Ended' },
          ]}
          {...form.getInputProps('status')}
        />
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
}
