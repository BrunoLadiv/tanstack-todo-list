import { TodoForm } from "@/components/todo-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/db";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowLeftIcon } from "lucide-react";
import z from "zod";

const getTodo = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const todo = await prisma.todo.findUnique({
      where: { id: data.id },
    });
    
    if (!todo) {
      throw notFound();
    }
    
    return todo;
  });

export const Route = createFileRoute("/todos/$todoId/edit")({
  component: EditTodoComponent,
  loader: async ({ params }) => {
    return getTodo({ data: { id: params.todoId } });
  },
});

function EditTodoComponent() {
  const todo = Route.useLoaderData();

  return (
    <div className="container space-y-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <Link to="/">
          <ArrowLeftIcon /> Back to List
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Todo</CardTitle>
          <CardDescription>
            Update the details of your todo item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TodoForm todo={todo} />
        </CardContent>
      </Card>
    </div>
  );
}
