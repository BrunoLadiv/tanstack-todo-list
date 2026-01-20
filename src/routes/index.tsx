import { createFileRoute, Link } from "@tanstack/react-router";
import { prisma } from "@/db";
import { createServerFn } from "@tanstack/react-start";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodoIcon, PlusIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  return prisma.todo.findMany();
});

export const Route = createFileRoute("/")({
  component: App,
  loader: () => {
    return getTodos();
  },
});

function App() {
  const todos = Route.useLoaderData();
  const completedCount = todos.filter((todo) => todo.completed).length;
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
          <Button size="sm">
            <Link to="/todos/new">
              <PlusIcon />
              New Todo
            </Link>
          </Button>
        </div>
      </div>
      <TodoListTable todos={todos} />
    </div>
  );
}

function TodoListTable({
  todos,
}: {
  todos: Array<{
    id: string;
    name: string;
    isCompleted: boolean;
    createdAt: Date;
  }>;
}) {
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
}
