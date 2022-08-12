import { Text, TextInput, Button, Group, Container, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { APILayer } from '@Types/api';
import { Type } from '@Types/entities';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();
  const { productId } = router.query;

  const form = useForm({
    initialValues: {} as APILayer,
    validate: {},
  });

  const onSubmit = async (data: APILayer) => {
    // alert(JSON.stringify(data))

    await fetch('http://localhost:8080/api/v1/layer/create', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        product_id: Number(productId as string),
      } as APILayer),
    });

    router.push(`/product/${productId}`);
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Create new Layer
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
