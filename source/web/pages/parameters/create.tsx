import { Text, TextInput, Button, Group, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { APIParameter } from '@Types/api';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {} as APIParameter,
    validate: {},
  });

  const onSubmit = async (data: APIParameter) => {
    await fetch('http://localhost:8080/api/v1/parameter/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // console.log(await resp.json());
    router.push('/parameters');
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Create new Parameter
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Parameter's name"
          {...form.getInputProps('name')}
        />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
}
