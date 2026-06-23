interface StudentProgressMetrics {
  studentName: string;
  totalBlocksUsed: number;
  syntaxErrorsFound: number;
  mostFrequentBlockTypes: string[];
}

interface ClassroomReportSummary {
  totalRosterSize: number;
  activeWorkspaces: number;
  classroomSuccessRate: number;
  frequentCodingIssues: number;
}

export function compileClassroomDiagnostics(rosterSnapshots: any[]): ClassroomReportSummary {
  let activeUsersCount = 0;
  let syntaxExceptionsCount = 0;
  let totalWorkspaceEvaluations = 0;

  rosterSnapshots.forEach((studentWorkspace) => {
    const blockList = studentWorkspace.blocks_state?.blocks || [];

    if (blockList.length > 0) {
      activeUsersCount++;
    }

    if (studentWorkspace.compilation_status === 'FAILED') {
      syntaxExceptionsCount++;
    }

    totalWorkspaceEvaluations++;
  });

  const successRate = totalWorkspaceEvaluations > 0
    ? ((totalWorkspaceEvaluations - syntaxExceptionsCount) / totalWorkspaceEvaluations) * 100
    : 100;

  return {
    totalRosterSize: rosterSnapshots.length,
    activeWorkspaces: activeUsersCount,
    classroomSuccessRate: Math.round(successRate),
    frequentCodingIssues: syntaxExceptionsCount
  };
}