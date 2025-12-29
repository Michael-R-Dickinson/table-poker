## Tools

### Tailwind
Use tailwind for styling primarily.

### ShadCn
Use ShadCn as your UI library. You have access to the ShadCn MCP server to browse, search, and install components from registries.

### Lucide React 
For icons

## Structure
Each UI Design should be self contained in its own directory under pages. This means you should not define css, or components relevant to a particular page/design outside of its directory. An example of this is the `src/pages/PulseMinimal` which has its full design contained within that dir. 

You can still add and use shadcn components in your design, just after adding the component, move it to the page's directory. 

## Procedure
Remember to build and lint before finishing a page. It is very important you do this to ensure it runs smoothly

Also when you're done will a page, add it to the routes in App.tsx. Also add a link to the page in the Home.tsx links. 