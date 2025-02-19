import { ActionIcon, AppShell, Flex, Menu, Table, Tabs, Title } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import React from "react";
import { Link, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import type { EntityHistory, EntityHistoryResponse } from "../../src/controllers/entity/entityService";
import { getEntities, getEntitiesHistory, verifyUser } from "../utils/api";
import { extractJwtToken } from "../utils/user";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const token = await extractJwtToken(request);
  if (token == null) {
    return redirect("/login",);
  }

  const user = await verifyUser(token);
  if (user == null) {
    return redirect("/login",);
  }
  const entities = await getEntities(token);
  const history = await getEntitiesHistory(token, entities);
  return Response.json({
    username: user.username,
    isAdmin: user.is_admin,
    entities,
    history,
  });
}

export default function Login() {
  const user = useLoaderData<typeof loader>() as {
    username: string;
    isAdmin: boolean;
    entities: string[];
    history: EntityHistoryResponse[]
  };
  return <AppShell
    header={{ height: 60 }}
    padding="md">
    <AppShell.Header p="md">
      <Flex direction="row" justify="space-between" align="center" h="100%">
        <Title order={4}>Schemaless</Title>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="filled">
              <IconUser style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{user.username}</Menu.Label>
            <Menu.Item component={Link} to="/generate-token">
              Generate Token
            </Menu.Item>
            <Menu.Item component={Link} to="/revoke-tokens">
              Revoke Tokens
            </Menu.Item>
            {user.isAdmin && <Menu.Item component={Link} to="/admin">Admin</Menu.Item>}
            <Menu.Item component={Link} to="/logout" leftSection={<IconLogout size={14} />}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </AppShell.Header>
    <AppShell.Main>
      {user.history.length == 0 && <div>No Entities present</div>}
      {user.history.length > 0 &&
        <Tabs defaultValue={user.history[0].entity_name}>
          <Tabs.List>
            {user.history.map((history) => <Tabs.Tab key={history.entity_name} value={history.entity_name}>{history.entity_name}</Tabs.Tab>)}
          </Tabs.List>
          {user.history.map((history) => <Tabs.Panel value={history.entity_name} key={history.entity_name}>
            <EntityHistory data={history.data} />
          </Tabs.Panel>)}
        </Tabs>
      }
    </AppShell.Main>
  </AppShell>
}

function EntityHistory({ data }: { data: EntityHistory[] }) {
  const rows = data.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.action}</Table.Td>
      <Table.Td>{element.entity_id}</Table.Td>
      <Table.Td>{JSON.stringify(element.payload)}</Table.Td>
      <Table.Td>{dayjs(element.timestamp).toISOString()}</Table.Td>
    </Table.Tr>
  ));

  return <Table>
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Action</Table.Th>
        <Table.Th>Entity ID</Table.Th>
        <Table.Th>Payload</Table.Th>
        <Table.Th>Timestamp</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {rows}
    </Table.Tbody>
  </Table>;
}