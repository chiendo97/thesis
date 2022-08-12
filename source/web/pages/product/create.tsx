import { Text, TextInput, Button, Group, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { Product } from '../../types/entities';

export default function IndexPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {} as Product,
    validate: {},
  });

  const onSubmit = async (data: Product) => {
    await fetch('http://localhost:8080/api/v1/product/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // console.log(await resp.json());
    router.push('/product');
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Create new Product
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
