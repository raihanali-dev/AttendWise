import { Header } from "@/components/layout/header";
import { SubjectForm } from "@/components/subjects/subject-form";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubjects } from "@/actions/subjects";
import { DeleteSubjectButton } from "@/components/subjects/delete-subject-button";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <>
      <Header title="Subjects" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <div className="flex justify-end">
          <SubjectForm mode="create" />
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon="book-open"
            title="No subjects added"
            description="Add your college subjects with attendance weights. Labs can have higher weights."
            actionLabel="Add Subject"
            actionHref="/subjects"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      {subject.code && (
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      )}
                    </div>
                    <Badge variant="secondary">Weight {subject.attendanceWeight}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <SubjectForm
                      mode="edit"
                      defaultValues={{
                        id: subject.id,
                        name: subject.name,
                        code: subject.code ?? "",
                        attendanceWeight: subject.attendanceWeight,
                      }}
                    />
                    <DeleteSubjectButton id={subject.id} name={subject.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
