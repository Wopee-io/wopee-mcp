# Wopee MCP Tool - Usage Examples

This document provides practical examples of how to use the Wopee MCP tool based on real-world usage scenarios.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Analysis Management](#analysis-management)
3. [Test Case Generation](#test-case-generation)
4. [Test Execution](#test-execution)
5. [Data Retrieval](#data-retrieval)
6. [Advanced Usage](#advanced-usage)

## Getting Started

### 1. Dispatch a New Analysis

Start by creating a new analysis for your application:

```
Dispatch analysis
```

**Example:**
```
Dispatch analysis
```

**With additional instructions:**
```
Dispatch analysis with additional instructions: "All outputs has to be in Czech Language"
```

### 2. Check Analysis Status

Monitor the status of your analysis:

```
What is the status of my analysis?
```

```
Show me all available analysis suites
```

```
Tell me the statuses of all analysis
```

## Analysis Management

### 3. Generate Application Context

Create a comprehensive application context document:

```
Generate app context
```

This will analyze your application and create detailed documentation about its structure, functionality, and user workflows.

### 4. Generate User Stories

Create user stories based on your application analysis:

```
Generate general user stories
```

```
Generate user stories
```

```
Generate user stories with additional instructions: "All outputs has to be in Portuguese language"
```

### 5. Generate Test Cases

Create test cases from your user stories:

```
Generate test cases
```

```
Generate test cases with additional instructions: "Focuss on fields validations, make sure to test all fields. Use USD and EUR currencies. Focus on payment flows."
```

## Test Case Generation

### 6. View Generated Test Cases

Get a comprehensive overview of all generated test cases:

```
Give me all the generated tests in some nice tabular view
```

**Example output format:**
- User stories with test counts
- Detailed test case descriptions
- Step-by-step test procedures

### 7. View User Stories

Get a formatted list of user stories:

```
Give me a list of the user stories in bullet points format
```

**Enhanced format:**
```
Give me a list of the user stories in bullet points format, but make it more colorful and in tabular format
```

**With test counts:**
```
Give me the same table with the user stories but also provide a column with number of tests per story
```

## Test Execution

### 8. Run Specific Tests

Execute tests from a specific user story:

```
Dispatch all tests for user story US001
```

```
Now use agent dispatch tool and run all tests for user story US001
```

**Example:**
```
Dispatch agent to run all tests for user story US001
```

### 9. Check Test Execution Status

Monitor test execution:

```
What about now?
```

```
Try it now
```

```
Rerun now
```

## Data Retrieval

### 10. Get Test Cases from Specific Analysis

Retrieve test cases from a particular analysis suite:

```
Give me all tests from the A001
```

```
Show me test cases from analysis A007
```

### 11. Fetch Analysis Suites

Get all available analysis suites:

```
Fetch all available analysis
```

```
Show me all analysis suites for my project
```

### 12. Check Test Statuses

Monitor test execution statuses:

```
Do you know the test statuses?
```

```
What are the current test execution results?
```

## Advanced Usage

### 13. Multi-Language Support

Generate content in specific languages:

```
Generate app context with language: Czech
```

```
Generate user stories in Slovak language
```

### 14. Custom Analysis Instructions

Provide specific analysis requirements:

```
Dispatch analysis with instructions: "Focus on payment flows and error handling"
```

```
Generate test cases with focus on security testing like password validation, email validation, etc.
```

## Common Workflows

### Complete Testing Workflow

1. **Start Analysis:**
   ```
   Dispatch analysis
   ```

2. **Generate Content:**
   ```
   Generate app context
   Generate user stories
   Generate test cases
   ```

3. **Review Results:**
   ```
   Give me all the generated tests in tabular format
   ```

4. **Execute Tests:**
   ```
   Dispatch agent to run test TC001 from US001
   ```

5. **Monitor Status:**
   ```
   What are the test execution statuses?
   ```

### Analysis Comparison Workflow

1. **Get All Analyses:**
   ```
   Fetch all available analysis
   ```

2. **Compare Results:**
   ```
   Show me test cases from analysis A001
   Show me test cases from analysis A002
   ```

3. **Check Statuses:**
   ```
   Tell me statuses of all analysis
   ```

## Tips and Best Practices

### 1. Use Descriptive Analysis Names
- Include the application name and version
- Add date or iteration information
- Example: `"E-commerce App v2.1 - Payment Testing"`

### 2. Provide Clear Instructions
- Be specific about language requirements
- Include focus areas for testing
- Example: `"Focus on user authentication and payment flows"`

### 3. Monitor Progress
- Check analysis status regularly
- Wait for completion before proceeding
- Use status queries to track progress

### 4. Organize by Analysis
- Keep related tests in the same analysis
- Use consistent naming conventions
- Document analysis purposes

### 5. Test Execution
- Start with single test cases
- Monitor execution status
- Scale up to multiple tests once stable

## Error Handling

### Common Issues and Solutions

1. **"User not found" error:**
   - Check API key configuration
   - Verify project permissions
   - Contact support if persistent

2. **"Analysis not found" error:**
   - Verify project UUID
   - Check analysis completion status
   - Ensure analysis exists

3. **"Test execution failed" error:**
   - Check test case validity
   - Verify application accessibility
   - Review test steps

## Integration Examples

### With CI/CD Pipelines

```bash
# Dispatch analysis
wopee-mcp dispatch-analysis --project-uuid "your-uuid"

# Generate test cases
wopee-mcp generate-test-cases --project-uuid "your-uuid" --suite-uuid "suite-uuid"

# Execute tests
wopee-mcp dispatch-agent --project-uuid "your-uuid" --test-case "TC001"
```

### With Test Management Tools

1. Export test cases to your preferred format
2. Import into test management tools
3. Schedule automated test execution
4. Monitor results and generate reports

## Support and Resources

- **Documentation:** Check README.md for detailed API documentation
- **Configuration:** See INTEGRATION.md for setup instructions
- **Quick Start:** Follow QUICK_START.md for immediate setup
- **Examples:** Use this file for practical usage examples

## Example Session Flow

Here's a complete example session:

```
User: Dispatch analysis

Assistant: ✅ Analysis successfully dispatched! Analysis UUID: 008ccdd2-91a3-432e-8086-020bf337eaa7

User: Generate app context

Assistant: ✅ App context generated successfully!

User: Generate user stories

Assistant: ✅ User stories generated successfully!

User: Give me all the generated tests in tabular format

Assistant: 📊 Here are all your generated test cases...

User: Dispatch agent to run test TC001 from US001

Assistant: ✅ Test execution started successfully!
```

This workflow demonstrates the complete cycle from analysis creation to test execution, providing a practical template for other users to follow.
