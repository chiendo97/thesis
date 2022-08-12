import { Text, TextInput, Button, Group, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { SummaryProduct } from '@Types/api';
import { Product } from '@Types/entities';
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
  const { productId } = router.query;

  const product = products.find((entity) => entity.id.toString() === (productId as string));
  if (!product) {
    return <>404</>;
  }

  const form = useForm({
    initialValues: product,
    validate: {},
  });

  const onSubmit = async (data: Product) => {
    const resp = await fetch('http://localhost:8080/api/v1/product/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    router.push('/product');
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Update Product
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Product's name"
          {...form.getInputProps('name')}
        />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
}
