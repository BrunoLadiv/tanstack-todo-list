import { createFileRoute, Link } from "@tanstack/react-router";
import { prisma } from "@/db";
import { createServerFn } from "@tanstack/react-start";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodoIcon, PlusIcon, EditIcon, Trash2Icon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  return prisma.todo.findMany();
});

const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await prisma.todo.delete({
      where: { id: data.id },
    });
  });

const toggleTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), isComplete: z.boolean() }))
  .handler(async ({ data }) => {
    await prisma.todo.update({
      where: { id: data.id },
      data: { isComplete: data.isComplete },
    });
  });

export const Route = createFileRoute("/")({
  component: App,
  loader: () => {
    return getTodos();
  },
});

function App() {
  const todos = Route.useLoaderData();
  const completedCount = todos.filter((todo) => todo.isComplete).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen container space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div className="space-y-2">
          <div className="text-4xl font-bold">Todo List</div>
          {totalCount > 0 && (
            <Badge variant="outline">
              {completedCount} of {totalCount} completed
            </Badge>
          )}
        </div>
        <div>
          <Button size="sm" asChild>
            <Link to="/todos/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Todo
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoListTable todos={todos} />
        </CardContent>
      </Card>
    </div>
  );
}

function TodoListTable({
  todos,
}: {
  todos: Array<{
    id: string;
    name: string;
    isComplete: boolean;
    createdAt: Date;
  }>;
}) {

  const deleteTodoFn = useServerFn(deleteTodo);
  const toggleTodoFn = useServerFn(toggleTodo);
  const router = useRouter();

  if (todos.length === 0)
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListTodoIcon />
          </EmptyMedia>
          <EmptyTitle>No Todos</EmptyTitle>
          <EmptyDescription>Try adding a new todo</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/todos/new">
              <PlusIcon />
              New Todo
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todos.map((todo) => (
            <TableRow key={todo.id}>
              <TableCell>
                <Checkbox
                  checked={todo.isComplete}
                  onCheckedChange={async (checked) => {
                    await toggleTodoFn({
                      data: { id: todo.id, isComplete: !!checked },
                    });
                    router.invalidate();
                  }}
                />
              </TableCell>
              <TableCell className={todo.isComplete ? "line-through text-muted-foreground" : "font-medium"}>
                {todo.name}
              </TableCell>
              <TableCell>{new Date(todo.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="icon" variant="outline" asChild>
                  <Link
                    to="/todos/$todoId/edit"
                    params={{ todoId: todo.id }}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={async () => {
                    await deleteTodoFn({ data: { id: todo.id } });
                    router.invalidate();
                  }}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
