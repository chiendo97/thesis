import { Text, TextInput, Button, Group, Container, ActionIcon, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons';
import { APIGroup } from '@Types/api';
import { Parameter } from '@Types/entities';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

export const getServerSideProps = async () => {
  const res = await fetch('http://localhost:8080/api/v1/parameter');
  const parameters: string[] = await res.json();

  return { props: { parameters } };
};

export default function IndexPage({
  parameters,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { productId, layerId, experimentId } = router.query;

  const form = useForm({
    initialValues: {
      id: 0,
      name: '',
      parameters: [{}] as Parameter[],
    } as APIGroup,
    validate: {},
  });

  const onSubmit = async (data: APIGroup) => {
    // alert(JSON.stringify(data));

    await fetch('http://localhost:8080/api/v1/group/create', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        exp_id: Number(experimentId as string),
      } as APIGroup),
    });

    router.push(`/product/${productId}/layer/${layerId}/experiment/${experimentId}`);
  };

  return (
    <Container size="xs">
      <Text component="h2" color="primary">
        Create new Test Group
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          required
          label="Name"
          placeholder="Test Group's name"
          {...form.getInputProps('name')}
        />
        {form.values.parameters &&
          form.values.parameters.map((_, index) => (
            <Group key={index} spacing="xs">
              <Select
                placeholder="Parameter's name"
                sx={{ flex: 1 }}
                required
                data={parameters.map((name) => ({
                  value: name,
                  label: name,
                }))}
                {...form.getInputProps(`parameters.${index}.name`)}
              />
              <TextInput
                placeholder="Parameter's value"
                sx={{ flex: 1 }}
                required
                {...form.getInputProps(`parameters.${index}.value`)}
              />
              <ActionIcon color="red" onClick={() => form.removeListItem('parameters', index)}>
                <IconTrash size={64} />
              </ActionIcon>
            </Group>
          ))}
        <Group position="right" mt="md">
          <Button
            onClick={() => {
              form.insertListItem('parameters', {
                name: '',
                value: '',
              });
            }}
          >
            Add parameters
          </Button>
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
}
