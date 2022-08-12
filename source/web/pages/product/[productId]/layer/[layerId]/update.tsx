import { Text, TextInput, Button, Group, Container, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { APILayer, SummaryProduct } from '@Types/api';
import { Type } from '@Types/entities';
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
    initialValues: { ...layer, product_id: Number(productId as string) } as APILayer,
    validate: {},
  });

  const onSubmit = async (data: APILayer) => {
    // alert(JSON.stringify(data))

    await fetch('http://localhost:8080/api/v1/layer/update', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        product_id: Number(productId as string),
      } as APILayer),
    });

    router.push(`/product/${productId}/layer/${layerId}`);
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Update Layer
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Layer's name"
          {...form.getInputProps('name')}
        />
        <Select
          label="Hash Strategy"
          placeholder="Pick one"
          required
          data={[
            { value: Type.USER_ID, label: 'By UserId' },
            { value: Type.SESSION_ID, label: 'By SessionId' },
          ]}
          {...form.getInputProps('type')}
        />
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
}
